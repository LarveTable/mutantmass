import { type Dictionary } from './en'

export const fr: Dictionary = {
    profile: {
        common: {
            notSet: "Non défini",
            error: "Une erreur est survenue",
            cancel: "Annuler",
            saving: "Enregistrement...",
            update: "Mettre à jour",
            loading: "Chargement...",
            years: "ans",
            kg: "kg",
            cm: "cm",
            version: "MutantMass v0.1.0-beta"
        },
        personalInfo: {
            title: "Infos Personnelles",
            name: "Nom",
            noName: "Aucun nom défini",
            age: "Âge",
            sex: "Sexe",
            male: "Homme",
            female: "Femme",
            other: "Autre",
            weight: "Poids",
            height: "Taille",
            memberSince: "Membre depuis"
        },
        training: {
            title: "Entraînement",
            weeklyGoal: "Objectif hebdomadaire",
            workoutsPerWeek: "séances / semaine"
        },
        bmi: {
            title: "IMC",
            underweight: "Insuffisance pondérale",
            normal: "Normal",
            overweight: "Surpoids",
            obese: "Obésité"
        },
        changePassword: {
            title: "Changer le mot de passe",
            currentPassword: "Mot de passe actuel",
            newPassword: "Nouveau mot de passe",
            confirmPassword: "Confirmer le mot de passe",
            errorMinChars: "Le mot de passe doit faire au moins 8 caractères",
            errorMatch: "Les mots de passe ne correspondent pas",
            success: "Mot de passe mis à jour !"
        },
        account: {
            title: "Compte",
            changePassword: "Changer de mot de passe",
            logout: "Déconnexion",
            deleteAccount: "Supprimer le compte",
            language: "Langue",
        },
        deleteDialog: {
            title: "Détruire le compte",
            description: "Écoute bien. Ça va supprimer définitivement ton compte, tes entraînements et tous tes gains de nos serveurs. Pas de retour en arrière possible.",
            confirmLabel: "Entre ton mot de passe pour prouver que c'est toi",
            placeholder: "Ton mot de passe",
            cancel: "Laisse tomber",
            confirm: "Tout détruire",
            errorPassword: "S'il te plaît, entre ton mot de passe"
        }
    },
    auth: {
        common: {
            email: "Email",
            emailPlaceholder: "toi@exemple.com",
            password: "Mot de passe",
            passwordPlaceholder: "••••••••",
            logoAlt: "Logo Mutant Mass"
        },
        login: {
            title: "Bon retour",
            description: "Connecte-toi à ton compte",
            submit: "Se connecter",
            signingIn: "Connexion...",
            noAccount: "Pas encore de compte ?",
            registerLink: "S'inscrire",
            errorInvalid: "Email ou mot de passe invalide"
        },
        register: {
            title: "Créer un compte",
            description: "Commence à suivre tes progrès",
            name: "Nom",
            namePlaceholder: "Ton Nom",
            confirmPassword: "Confirmer le mot de passe",
            betaCode: "Code d'accès Beta",
            betaCodePlaceholder: "Entre ton code d'invitation",
            submit: "Créer le compte",
            submitting: "Création du compte...",
            hasAccount: "Déjà un compte ?",
            loginLink: "Se connecter",
            errorMatch: "Les mots de passe ne correspondent pas",
            errorMinChars: "Le mot de passe doit faire au moins 8 caractères"
        }
    }
}
