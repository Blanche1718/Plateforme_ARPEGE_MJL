const jwt = require('jsonwebtoken');
const { Keycloak } = require('keycloak-connect'); // Ou une bibliothèque comme 'openid-client'
const { Op, where } = require('sequelize');
const config = require('../config/auth');
const { User, ValidToken, Role, Entite, Mutation, Juridiction } = require('../models/index');
const utils = require('./utils');

class AuthService {
  constructor() {
    this.jwksCache = null; // Instance variable for JWKS cache
    this.jwksCacheExpiration = null; // Instance variable for cache expiration
  }

  static async fetchJWKS() {
    const keycloakRealm = process.env.KEYCLOAK_REALM;
    const keycloakUrl = `${process.env.KEYCLOAK_URL}/realms/${keycloakRealm}/protocol/openid-connect/certs`;

    // Check if the cache is expired
    if (this.jwksCache && Date.now() < this.jwksCacheExpiration) {
      return this.jwksCache;
    }

    const response = await fetch(keycloakUrl);
    if (!response.ok) {
      throw new Error('Unable to fetch JWKS');
    }

    const data = await response.json();
    this.jwksCache = data.keys; // Store keys in instance variable
    this.jwksCacheExpiration = Date.now() + 3600000; // Cache for 1 hour
    return this.jwksCache;
  }
  static async authenticate(req, roles = []) {
    let tokenWithBearer = req.headers.authorization || req.cookies.jwtToken;
    console.log("Tokens: ",req.headers, req.cookies)
    if (!tokenWithBearer) {
      return { status: 401, message: 'Veillez vous authentifier' };
    }

    if (!tokenWithBearer.startsWith('Bearer ')) {
      return { status: 401, message: 'Veillez vous authentifier' };
    }

    const token = tokenWithBearer.split(' ')[1];

    let keycloak_auth_ok = true;

    // Essayer l'authentification Keycloak
    let result_authentication = await this.authenticateKeycloak(token, req, roles);
    if (result_authentication.status === 200) {
      return result_authentication;
    }else{
      keycloak_auth_ok = false;
    }

    let local_auth = null;
    if(!keycloak_auth_ok){
      // Essayer l'authentification locale
      local_auth = await this.authenticateLocal(token, req, roles);
      if (local_auth.status === 200) {
        return local_auth;
      }
    }
    return { status: 401, message: 'Veillez vous authentifier || ' + result_authentication.message };
  }

  static async authenticateLocal(token, req, roles) {
    try {
      // Vérifier l'expiration
      if (await utils.expired(token)) {
        return { status: 401, message: 'Token local expiré' };
      }

      // Décoder le token
      const decodedJwt = utils.verifyToken(token);
      if (!decodedJwt) {
        return { status: 401, message: 'Token local invalide' };
      }

      // Construire la requête utilisateur
      const userQuery = {
        where: {
          [Op.and]: [{ id: decodedJwt.user._id }, { disabled: false }],
        },
        include: [
          {
            model: ValidToken,
            as: 'tokens',
            where: { token },
          },
        ],
      };

      if (roles.length > 0) {
        userQuery.include.push({
          model: Role,
          as: 'role',
          where: { code: { [Op.or]: roles } }
        });
      }

      // console.log("Query: ", userQuery);
      const user = await User.findOne(userQuery);
      if (!user) {
        return { status: 401, message: 'Utilisateur local non trouvé ou désactivé' };
      }

      // Ajouter les informations à req
      req.userId = decodedJwt.user._id;
      req.name = `${user.prenoms} ${user.nom}`;
      req.email = user.email;
      req.token = token;
      req.authType = 'local';
      req.date_of_service = user.date_of_service;
      return { status: 200 };
    } catch (error) {
      console.error('Erreur authentification locale:', error);
      return { status: 401, message: 'Erreur authentification locale' };
    }
  }

  static async authenticateKeycloak(token, req, roles) {
    try {
      // Validate the Keycloak token
      const decoded = await this.validateToken(token);

      // Ensure the decoded token is valid
      if (!decoded || typeof decoded !== 'object' || !decoded.sub) {
        return { status: 401, message: 'Token invalide' };
      }

      // Extract user ID and roles from the token
      const userId = decoded.sub;
      if (!userId) {
        return { status: 401, message: 'User ID missing in token' };
      }

      const keycloakRoles = decoded.realm_access?.roles || [];

      console.log("Mapped roles: ", keycloakRoles);

      // Check if "notation" exists in the roles
      if (!keycloakRoles.includes("notation")) {
          return { status: 403, message: 'Accès non autorisé à cette application' };
      }

      // Filter roles that start with "notation_"
      const notationRoles = keycloakRoles.filter(role => role.startsWith("notation_"));

      // Check if the number of notation roles is greater than 1
      if (notationRoles.length != 1) {
          throw new Error("Veuillez contacter l'administrateur au sujet de la configuration de votre compte.");
      }

      // If no roles found, return an empty array or handle accordingly
      if (notationRoles.length === 0) {
          return [];
      }

      // Assuming Role is your Sequelize model for the roles table
      const rolesDb = await Role.findAll({
          where: {
              code_ad: {
                  [Op.in]: notationRoles // Use Sequelize's Op.in for the query
              }
          }
      });


      // Create a mapping from code_ad to code
      const codeMapping = {};
      rolesDb.forEach(role => {
          codeMapping[role.code_ad] = role.code;
      });

      // Replace roles with their corresponding codes
      const replacedRoles = notationRoles.map(role => codeMapping[role] || role);

    

      // Check of entite
      // Filter entite that start with "users_" 
      const entites = keycloakRoles.filter(role => role.startsWith("users_"));

      // Check if the number of entities is greater than 1
      if (entites.length != 1) {
          throw new Error("Veuillez contacter l'administrateur au sujet de la configuration de votre compte.");
      }

      const entitiesDb = await Entite.findAll({
            where: {
                code_ad: {
                  [Op.in]: entites // Use Sequelize's Op.in for the query
              }
            }
      });

      const juri = await Juridiction.findAll({
          where: {
              code_ad: {
                  [Op.in]: entites // Use Sequelize's Op.in for the query
              }
          }
      })

      // Check for required roles
      if (roles.length > 0 && !roles.some(role => replacedRoles.includes(role))) {
        return { status: 403, message: 'Insufficient Keycloak roles' };
      }

      // Check decoded.email and check if i'ts @gouv.bj or justice.bj if not throw error
      if (!decoded.email || !utils.isGouvOrJusticeMail(decoded.email)) {
        return { status: 401, message: 'Invalid Keycloak email' };
      }

      // Extract user names
      let first_name = 'Keycloak';
      let last_name = 'User';
      if (decoded.given_name) {
        const nameParts = decoded.given_name.trim().split(' ').filter(Boolean);
        last_name = nameParts.length > 1 ? nameParts.pop() : decoded.family_name || 'User';
        first_name = nameParts.join(' ');
      } else if (decoded.family_name) {
        last_name = decoded.family_name;
      }

      // Find or create the user in the local database
      let user = await User.findOne({ 
          where: {
              [Op.or]: [
                  { id: userId, email: decoded.email, disabled: false },
                  { email: decoded.email, disabled: false }
              ]
          }
       });

      if (!user) {
        user = await User.create({
          id: userId,
          email: decoded.email,
          password: 'keycloak', // Placeholder, not used
          first_name,
          last_name,
          disabled: false,
          first_connect: false,
          role_id: rolesDb[0]?.id,
          entite_id: entitiesDb[0]?.id,
          juridiction_id: juri[0]?.id
        });
      }else{
        // verify if the last role is different from the new One
        if(user.role_id != rolesDb[0]?.id || (user.entite_id != entitiesDb[0]?.id && user.juridiction_id != juri[0]?.id)){
          if(user.entite_id != entitiesDb[0]?.id || user.juridiction_id != juri[0]?.id){
            if(user.onTransfer == true){
              const transfertInfo = await Mutation.findOne({
                  where: { agent_id: user.id },
                  include: {
                      model: Statut,
                      as: 'statutIn',
                      where: {
                        code: 'pending'
                      }
                  }
              });
              if(transfertInfo && transfertInfo.entite_end.code_ad == entitiesDb[0]?.code_ad && transfertInfo.juridiction_end.code_ad == juri[0]?.code_ad){
                await user.update({
                  // role_id: rolesDb[0]?.id,
                  entite_id: entitiesDb[0]?.id,
                  juridiction_id: juri[0]?.id
                });
              }
              return { status: 403, message: 'Accès non autorisé à cette application' };
            }
            return { status: 403, message: 'Accès non autorisé à cette application' };
          }
          return { status: 403, message: 'Accès non autorisé à cette application' };
        }
        else{
          // return { status: 403, message: 'Accès non autorisé à cette application' };
          console.log("user already exist: ", user);
        }
         
      }

      // Attach user information to the request object
      req.userId = userId;
      req.name = `${user.first_name} ${user.last_name}`;
      req.email = user.email;
      req.token = token;
      req.authType = 'keycloak';
      req.roles = replacedRoles;

      return { status: 200 };
    } catch (error) {
      console.error('Keycloak authentication error:', error);
      return { status: 401, message: 'Keycloak authentication error' };
    }
  }


  static async validateToken(token) {
    try {
      const jwks = await this.fetchJWKS();
      const decodedHeader = jwt.decode(token, { complete: true }).header;

      // console.log("jwks:", jwks);

      const key = jwks.find(k => k.kid === decodedHeader.kid);
      if (!key) {
        // throw new Error('Public key not found for kid');
        return false
      }


      const publicKey = utils.getPublicKey(jwks, decodedHeader.kid); // Implement this function as before

      const decoded = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
        // audience: "notation-frontend"
         //"process.env.KEYCLOAK_CLIENT_ID",
      });

      return decoded;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

}

module.exports = AuthService;