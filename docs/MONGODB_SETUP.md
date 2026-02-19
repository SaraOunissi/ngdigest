# Configuration MongoDB Atlas

## 1. Créer un compte MongoDB Atlas

1. Aller sur [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Cliquer sur **Try Free** et créer un compte (email ou connexion Google/GitHub)
3. Confirmer l'adresse email si nécessaire

## 2. Créer un cluster Free Tier

1. Une fois connecté, cliquer sur **Build a Database**
2. Sélectionner le plan **M0 Free** (gratuit, 512 Mo de stockage)
3. Choisir un cloud provider (AWS, GCP, ou Azure) et une région proche de vos utilisateurs
4. Nommer le cluster (ex : `ngdigest-cluster`) puis cliquer sur **Create Deployment**

## 3. Configurer l'accès

### Créer un utilisateur de base de données

1. Dans le panneau **Database Access** (menu latéral), cliquer sur **Add New Database User**
2. Choisir **Password** comme méthode d'authentification
3. Entrer un nom d'utilisateur et un mot de passe sécurisé
4. Attribuer le rôle **Read and Write to any database**
5. Cliquer sur **Add User**

### Configurer l'IP Whitelist

1. Dans le panneau **Network Access** (menu latéral), cliquer sur **Add IP Address**
2. Pour le développement local, cliquer sur **Allow Access from Anywhere** (`0.0.0.0/0`)
   - **En production**, restreindre aux IPs de votre serveur uniquement
3. Cliquer sur **Confirm**

## 4. Obtenir la connection string

1. Aller dans **Database** (menu latéral) et cliquer sur **Connect** à côté du cluster
2. Sélectionner **Drivers**
3. Copier la connection string, elle ressemble à :
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Remplacer `<username>` et `<password>` par les identifiants créés à l'étape 3
5. Ajouter le nom de la base de données (`ngdigest`) dans l'URI :
   ```
   mongodb+srv://monuser:monpassword@cluster0.xxxxx.mongodb.net/ngdigest?retryWrites=true&w=majority
   ```

## 5. Configurer le projet

1. Copier le fichier `.env.example` en `.env` à la racine du backend :
   ```bash
   cp .env.example .env
   ```
2. Remplacer la valeur de `MONGODB_URI` par votre connection string complète
3. Remplacer `JWT_SECRET` par une clé secrète forte (ex : générer avec `openssl rand -hex 32`)

## 6. Vérifier la connexion

Lancer le serveur en mode développement :

```bash
npm run start:dev
```

Si la connexion est réussie, vous verrez dans les logs NestJS que Mongoose s'est connecté sans erreur.
