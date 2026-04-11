import { type Dictionary } from './en'

export const fr: Dictionary = {
    nav: {
        home: "Accueil",
        workout: "Entraînement",
        history: "Historique",
        progress: "Progrès",
        profile: "Profil"
    },
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
        },
        noteDialog: {
            label: "Note de l'exercice",
            placeholder: "Astuces de forme, ressentis, choses à retenir..."
        },
        picker: {
            title: "Sélectionner un type",
            back: "Retour",
            search: "Rechercher des exercices...",
            addCustom: "Créer un exercice",
            noFound: "Aucun exercice trouvé",
            typeDesc: {
                WEIGHTED: "Barre, haltères, machines",
                BODYWEIGHT: "Aucun équipement requis",
                CARDIO: "Course, vélo, rameur"
            }
        },
        finishDialog: {
            title: "Terminer la séance",
            noteLabel: "Note de la séance (optionnelle)",
            notePlaceholder: "Comment c'était ? Des records ? Notes pour la prochaine fois...",
            saving: "Enregistrement...",
            finishBtn: "Terminer 🎉"
        },
        listDialog: {
            title: "Exercices ajoutés",
            description: "Gérer vos exercices personnalisés",
            loading: "Chargement des exercices...",
            empty: "Aucun exercice personnalisé ajouté pour le moment.",
            publicInfo: "Public",
            privateInfo: "Privé",
            editHover: "Modifier l'exercice",
            deleteHover: "Supprimer l'exercice privé",
            deleteConfirm: {
                title: "Supprimer l'exercice personnalisé ?",
                desc1: "Êtes-vous sûr de vouloir supprimer cet exercice personnalisé ? Cela ",
                descBold: "le supprimera de votre bibliothèque et de vos entraînements",
                desc2: ".",
                confirm: "Supprimer"
            }
        },
        logPastDialog: {
            titleInfo: "Saisir une séance passée",
            titleExercises: "Exercices & Séries",
            nameLabel: "Nom de la séance (optionnel)",
            namePlaceholder: "ex. Push Day",
            dateLabel: "Date",
            dateRequired: "La date est requise",
            durationLabel: "Durée (optionnelle)",
            restTimerLabel: "Temps de repos",
            restTimerDesc: "Enregistrer la durée de repos pour cette séance",
            seconds: "secondes",
            noteLabel: "Note de la séance (optionnelle)",
            notePlaceholder: "Comment c'était ?",
            addSet: "Ajouter série",
            addExercise: "Ajouter exercice",
            nextBtn: "Suivant",
            saveBtn: "Enregistrer la séance",
            miniPicker: {
                search: "Rechercher...",
                addCustom: "Créer un exercice"
            },
            units: {
                reps: "Reps",
                kg: "kg",
                min: "Min",
                km: "km"
            }
        },
        logSetDialog: {
            repsLab: "Reps",
            weightLab: "Poids (kg)",
            durLab: "Durée (minutes)",
            minutesPh: "Minutes",
            distLab: "Distance (km) — optionnelle",
            kmPh: "km",
            lastPrefix: "Dernier : ",
            kgSuffix: " kg",
            logBtn: "Valider la série"
        },
        restTimer: {
            title: "Temps de repos",
            minus15: "-15s",
            plus15: "+15s"
        },
        addDialog: {
            addTitle: "Ajouter un exercice personnalisé",
            editTitle: "Modifier l'exercice",
            imageOptional: "Image (optionnelle)",
            tapToUpload: "Appuyez pour télécharger",
            imageReqs: "JPEG, PNG, WebP — max 5Mo",
            nameLabel: "Nom de l'exercice",
            namePlaceholder: "ex. Élévations latérales poulie",
            nameRequired: "Le nom de l'exercice est requis",
            typeLabel: "Type",
            muscleGroupLabel: "Groupe musculaire",
            targetMuscleLabel: "Muscles ciblés (Optionnel)",
            makePublic: "Rendre public",
            makePublicDesc: "Partager avec les autres utilisateurs",
            saveChanges: "Enregistrer",
            addExerciseBtn: "Ajouter l'exercice",
            saving: "Enregistrement...",
            adding: "Ajout...",
            errorGeneric: "Quelque chose a mal tourné",
            publicWarning: {
                title: "Rendre public ?",
                desc1: "Vous êtes sur le point de rendre cet exercice public. Une fois public, il sera visible par tous les utilisateurs et ",
                descBold: "ne pourra plus être supprimé",
                desc2: ". Êtes-vous sûr de vouloir continuer ?",
                confirm: "Oui, rendre public"
            },
            types: {
                WEIGHTED: "Poids libres",
                BODYWEIGHT: "Poids du corps",
                CARDIO: "Cardio"
            },
            muscles: {
                CHEST: "Pectoraux",
                BACK: "Dos",
                SHOULDERS: "Épaules",
                BICEPS: "Biceps",
                TRICEPS: "Triceps",
                FOREARMS: "Avant-bras",
                LEGS: "Jambes",
                GLUTES: "Fessiers",
                CORE: "Abdos",
                CARDIO: "Cardio",
                FULL_BODY: "Corps complet"
            },
            targets: {
                chest: "pectoraux",
                trapezius: "trapèzes",
                "upper-back": "haut du dos",
                "lower-back": "bas du dos",
                "front-deltoids": "deltoïdes antérieurs",
                "back-deltoids": "deltoïdes postérieurs",
                biceps: "biceps",
                triceps: "triceps",
                forearm: "avant-bras",
                quadriceps: "quadriceps",
                hamstring: "ischio-jambiers",
                calves: "mollets",
                adductor: "adducteurs",
                abductors: "abducteurs",
                gluteal: "fessiers",
                abs: "abdos",
                obliques: "obliques"
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
            exercises: {
                title: "Progrès par exercice",
                trackExercise: "Suivre un exercice",
                best: "Record",
                current: "Actuel",
                periodDelta: "Δ Période",
                sessions: "Séances",
                chooseExercise: "Choisir un exercice",
                removeSlot: "Retirer cet emplacement",
                hint: "Appuyez sur une carte pour les détails · ✏️ pour changer",
                repsMax: "reps max",
                volume: "Vol",
                labels: {
                    maxReps: "Max Reps",
                    distance: "Distance",
                    e1rm: "e1RM"
                }
            },
            records: {
                title: "Records personnels (top 10)",
                empty: "Pas encore de records — au boulot !",
                in: "en",
                e1rm: "e1RM",
                maxReps: "Max Reps",
                best: "Record"
            },
            consistency: {
                title: "Régularité",
                weeklyGoal: "Objectif hebdo :",
                xPerWeek: "x / semaine",
                streak: "combo",
                goalMet: "Objectif atteint !",
                last8weeks: "8 dernières semaines"
            }
        },
        overview: {
            workouts: "Séances",
            totalSets: "Séries totales",
            volume: "Volume",
            avgDuration: "Durée moy."
        },
        charts: {
            noData: "Pas de données pour cette période",
            volume: {
                weekOf: "Semaine du",
                total: "total",
                avg: "moy",
                toggle: {
                    total: "Total",
                    muscle: "Par muscle"
                }
            },
            heatmap: {
                front: "Face",
                back: "Dos",
                other: "Autre",
                first: "1er",
                second: "2e",
                third: "3e"
            }
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
            minAbbr: "min"
        },
        calendar: {
            days: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
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
        cancel: "Annuler",
        save: "Enregistrer",
        search: "Rechercher...",
        noData: "Aucune donnée"
    }
}
