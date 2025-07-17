#!/bin/sh

# Vérifier si l'argument pour l'environnement a été fourni
if [ -z "$1" ]; then
    echo "Aucun environnement spécifié. Utilisation de 'dev' par défaut."
    ENVIRONMENT="dev"
else
    ENVIRONMENT="$1"
fi



# Vérifier si le port a été fourni
if [ -z "$2" ]; then
    echo "Aucun port spécifié. Utilisation du port 7000 par défaut."
    PORT=8000
else
    PORT="$2"
fi


COMMAND="npm run $ENVIRONMENT"

echo "Démarrage du serveur avec la commande : $COMMAND"
# Démarrer le serveur en arrière-plan
$COMMAND &

echo  "Port: $PORT";
echo "Commande: $COMMAND";

# Attendre un court instant pour donner le temps au serveur de démarrer
sleep 5
echo "Vérification du démarrage du serveur sur le port $PORT..."

# Boucle pour attendre que le serveur soit prêt
for i in $(seq 1 10); do
    if nc -z localhost $PORT; then
        echo "Le serveur est prêt !"
        break
    fi
    echo "Attente du démarrage du serveur... ($i/10)"
    sleep 1
done

# Installer Chrome pour Puppeteer
echo "Installation de Chrome pour Puppeteer..."
npx puppeteer browsers install chrome
echo "Installation de Chrome terminée."

# Attendre que le serveur se termine (si nécessaire)
wait
echo "Le script a terminé."