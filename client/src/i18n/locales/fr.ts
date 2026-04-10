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
            title: "Bon retour !",
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
    },
    workout: {
        empty: {
            title: "Prêt à s'entraîner ?",
            description: "Commence une nouvelle séance ou enregistre un entraînement passé",
            start: "Commencer l'entraînement",
            logPast: "Saisir une séance",
            addExercise: "Ajouter un exercice",
            listAdded: "Exercices ajoutés"
        },
        loading: {
            template: "Création de l'entraînement depuis le template...",
            workout: "Chargement de l'entraînement..."
        },
        active: {
            defaultName: "Entraînement",
            exerciseCount: {
                one: "exercice",
                other: "exercices"
            },
            finish: "Terminer",
            addExercise: "Ajouter un exercice",
            deleteConfirm: {
                title: "Supprimer l'exercice ?",
                description: "Es-tu sûr de vouloir retirer cet exercice de ton entraînement ? Toutes les séries enregistrées seront perdues.",
                confirm: "Retirer"
            }
        }
    },
    progress: {
        title: "Progrès",
        periods: {
            all: "Tout",
            week: "7J",
            month: "1M",
            threeMonths: "3M"
        },
        sections: {
            muscleGroups: "Muscles travaillés (volume)",
            volume: "Évolution du volume",
            exercises: "Progrès par exercice",
            records: "Records personnels (top 10)",
            consistency: "Régularité"
        }
    },
    history: {
        title: "Historique",
        empty: {
            selectDay: "Sélectionne un jour pour voir ton entraînement"
        },
        stats: {
            sets: "séries",
            volume: "kg de volume"
        },
        duration: {
            hourAbbr: "h",
            minAbbr: "m"
        },
        deleteConfirm: {
            title: "Supprimer l'entraînement ?",
            description: "Es-tu sûr de vouloir supprimer cet entraînement ? Cela retirera tous les exercices et séries enregistrées pour cette séance. Cette action est irréversible.",
            confirm: "Supprimer"
        }
    },
    dashboard: {
        greetings: {
            morning: "Bonjour",
            afternoon: "Bon après-midi",
            evening: "Bonsoir",
            fallback: "toi"
        },
        stats: {
            thisWeek: "Cette semaine",
            workoutCount: {
                one: "entraînement",
                other: "entraînements"
            },
            goalMet: "Objectif atteint",
            streak: {
                one: "semaine de suite",
                other: "semaines de suite"
            }
        },
        quickStats: {
            sets: "Séries",
            volume: "Volume",
            time: "Temps",
            mostTrained: "Plus travaillé",
            last: "Dernier"
        },
        muscleStats: {
            title: "Muscles travaillés cette semaine",
            for: "pour",
            reps: "reps"
        },
        cta: {
            start: "C'est parti !"
        },
        lastWorkout: {
            title: "Dernière séance",
            today: "Aujourd'hui",
            yesterday: "Hier",
            daysAgo: "il y a {{count}}j"
        },
        activity: {
            title: "Activité",
            weightsIntensity: "Intensité Fonte",
            cardioIntensity: "Intensité Cardio / PDC",
            days: ["L", "M", "M", "J", "V", "S", "D"]
        }
    },
    common: {
        loading: "Chargement...",
        processing: "Traitement...",
        confirm: "Confirmer",
        cancel: "Annuler"
    }
}
