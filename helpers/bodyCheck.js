const { Validator, make } = require('simple-body-validator');

function areAllValuesInArray(a, b) {
  return a.every(value => b.includes(value));
}

const registerBodyCheck = async (body) => {
  const rules = {
      nom: 'required|string|min:3',
      prenoms: 'required|string|min:3|max:50',
      email: 'required|email',
      // password: 'required|string|confirmed|same:password_confirmation',
      telephone: 'required|string|min:8',
      roleID: 'required|integer|in:1,2,3,4,5,6,4,8,9'
  };
  const validator = make(body, rules);
  if (!validator.validate()) {
      console.log('Errors: ', validator.errors().all());
      return false;
  }
  return true;
};

const filterBodyCheck = async (body) => {
  const arr = ['rccm', 'nomEntreprise', 'typeEntreprise', 'telephone', 'communeDomicialiation', 'juridictionReference', 'email', 'statutEntreprise', 'numeroJugement', 'nomGerant', 'prenomsGerant'];
  const keys = Object.keys(body);
  const allValuesInArray2 = areAllValuesInArray(keys, arr);
  if (!allValuesInArray2) {
      return false;
  }
  return true;
};



const utilsBodyCheck = async (body) => {
  const rules = {
      libelle: 'required|string|max:1024'
  };
  const validator = make(body, rules);
  if (!validator.validate()) {
      return false;
  }
  return true;
};

const utilsMessageUsBodyCheck = async (body) => {
  const rules = {
      nom: 'required|string|max:255',
      email: 'required|string|email|max:255',
      sujet: 'required|string|max:255',
      message: 'required|string|min:10|max:2048',
      typeMessage: 'required|string|in:contact,suggestion,probleme'
  };

  const validator = make(body, rules);
  if (!validator.validate()) {
      return false;
  }
  return true;
};

const updateProfilePasswordBodyCheck = async (body) => {
  const rules = {
      email: 'required|email',
      apassword: 'required|string',
      password: 'required|string|confirmed|same:password_confirmation',
  };
  const validator = make(body, rules);
  if (!validator.validate()) {
      return false;
  }
  return true;
};

const updateProfileBodyCheck = async (body) => {
  const arr = ['nom', 'prenoms', 'email', 'tel', 'centreID'];
  const keys = Object.keys(body);
  const allValuesInArray2 = areAllValuesInArray(keys, arr);
  
  if (!allValuesInArray2) {
      return { valid: false, errors: ["Données manquantes ou non valides."] };
  }

  const schema = {
      nom: 'nullable|string|min:3',
      prenoms: 'nullable|string|min:3|max:50',
      email: 'nullable|email',
      tel: 'nullable|string'
  };

  const validator = make(body, schema);
  
  if (!validator.validate()) {
      // Capture validation errors
      const errors = validator.errors.all(); // Adjust this if your validation library has a different way to access errors
      return { valid: false, errors };
  }

  return { valid: true };
};


const updateProfile = async (body) => {
  const requiredFields = [
    'first_name',
    'last_name',
    'email',
    'date_of_birth',
    'place_of_birth',
    'date_of_marriage',
    'family_address',
    'spoken_languages',
    'military_status',
    'pension_scheme',
    'children',
    'diplomas',
    'promotions',
    'mutations',
    'honorary_distinction',
    'professions',
    'military_service',
    'signatures'
  ];

  const keys = Object.keys(body);
  const allValuesPresent = requiredFields.every(field => keys.includes(field));

  if (!allValuesPresent) {
    return { valid: false, errors: ["Données manquantes ou non valides."] };
  }

  const schema = {
    first_name: 'nullable|string|min:3|max:50',
    last_name: 'nullable|string|min:3|max:50',
    email: 'nullable|email',
    date_of_birth: 'nullable|date',
    place_of_birth: 'nullable|string|max:100',
    date_of_marriage: 'nullable|date',
    family_address: 'nullable|string|max:255',
    spoken_languages: 'nullable|string|max:255',
    military_status: 'nullable|string|max:50',
    pension_scheme: 'nullable|string|max:50',
    children: 'nullable|string',
    diplomas: 'nullable|string',
    promotions: 'nullable|string',
    mutations: 'nullable|string',
    honorary_distinction: 'nullable|string',
    professions: 'nullable|string',
    military_service: 'nullable|string',
  };

  const validator = make(body, schema);
  
  if (!validator.validate()) {
    // Capture validation errors
    const errors = validator.errors; // Adjust this if your validation library has a different way to access errors
    return { valid: false, errors };
  }

  return { valid: true };
};

const restorePasswordBodyCheck = async (body) => {
  const rules = {
      email: 'required|email',
      default_password: 'required|string'
  };
  const validator = make(body, rules);
  if (!validator.validate()) {
      return false;
  }
  return true;
};

const loginBodyCheck = async (body) => {
  const rules = {
      email: 'required|email',
      password: 'required|string'
  };
  
  const validator = make(body, rules);
  
  if (!validator.validate()) {
      console.log('Errors: ', validator.errors().all());
      return false;
  }
  return true;
};



module.exports = {
  registerBodyCheck,
  filterBodyCheck,
  utilsBodyCheck,
  utilsMessageUsBodyCheck,
  updateProfilePasswordBodyCheck,
  updateProfileBodyCheck,
  restorePasswordBodyCheck,
  loginBodyCheck,
  updateProfile

};
