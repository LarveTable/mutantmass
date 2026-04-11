export const en = {
    nav: {
        home: "Home",
        workout: "Workout",
        history: "History",
        progress: "Progress",
        profile: "Profile"
    },
    profile: {
        common: {
            notSet: "Not set",
            error: "Something went wrong",
            cancel: "Cancel",
            saving: "Saving...",
            update: "Update",
            loading: "Loading...",
            years: "years",
            kg: "kg",
            cm: "cm",
            version: "MutantMass v0.1.0-beta"
        },
        personalInfo: {
            title: "Personal Info",
            name: "Name",
            noName: "No name set",
            age: "Age",
            sex: "Sex",
            male: "Male",
            female: "Female",
            other: "Other",
            weight: "Weight",
            height: "Height",
            memberSince: "Member since"
        },
        training: {
            title: "Training",
            weeklyGoal: "Weekly Goal",
            workoutsPerWeek: "workouts / week"
        },
        bmi: {
            title: "BMI",
            underweight: "Underweight",
            normal: "Normal",
            overweight: "Overweight",
            obese: "Obese"
        },
        changePassword: {
            title: "Change Password",
            currentPassword: "Current password",
            newPassword: "New password",
            confirmPassword: "Confirm new password",
            errorMinChars: "Password must be at least 8 characters",
            errorMatch: "Passwords do not match",
            success: "Password updated!"
        },
        account: {
            title: "Account",
            changePassword: "Change Password",
            logout: "Log Out",
            deleteAccount: "Delete Account",
            language: "Language",
        },
        deleteDialog: {
            title: "Nuke Account",
            description: "Listen up. This permanently deletes your account, your workouts, and all your sick gains from our servers. You can't undo this.",
            confirmLabel: "Enter your password to prove it's you",
            placeholder: "Your password",
            cancel: "Nah, keep it",
            confirm: "Delete Everything",
            errorPassword: "Please enter your password"
        }
    },
    auth: {
        common: {
            email: "Email",
            emailPlaceholder: "you@example.com",
            password: "Password",
            passwordPlaceholder: "••••••••",
            logoAlt: "Mutant Mass Logo"
        },
        login: {
            title: "Welcome back",
            description: "Sign in to your account",
            submit: "Sign in",
            signingIn: "Signing in...",
            noAccount: "Don't have an account?",
            registerLink: "Register",
            errorInvalid: "Invalid email or password"
        },
        register: {
            title: "Create an account",
            description: "Start tracking your progress",
            name: "Name",
            namePlaceholder: "Your Name",
            confirmPassword: "Confirm password",
            betaCode: "Beta Access Code",
            betaCodePlaceholder: "Enter your invite code",
            submit: "Create account",
            submitting: "Creating account...",
            hasAccount: "Already have an account?",
            loginLink: "Sign in",
            errorMatch: "Passwords do not match",
            errorMinChars: "Password must be at least 8 characters"
        }
    },
    workout: {
        empty: {
            title: "Ready to train?",
            description: "Start a new workout or log a previous session",
            start: "Start Workout",
            logPast: "Log Past Workout",
            addExercise: "Add Exercise",
            listAdded: "List Added Exercises"
        },
        loading: {
            template: "Creating workout from template...",
            workout: "Loading workout..."
        },
        active: {
            defaultName: "Workout",
            exerciseCount: {
                one: "exercise",
                other: "exercises"
            },
            finish: "Finish",
            addExercise: "Add Exercise",
            deleteConfirm: {
                title: "Remove Exercise?",
                description: "Are you sure you want to remove this exercise from your workout? All recorded sets will be lost.",
                confirm: "Remove"
            }
        },
        noteDialog: {
            label: "Exercise note",
            placeholder: "Form cues, feelings, things to remember..."
        },
        picker: {
            title: "Select Type",
            back: "Back",
            search: "Search exercises...",
            addCustom: "Add custom exercise",
            noFound: "No exercises found",
            typeDesc: {
                WEIGHTED: "Barbell, dumbbell, machine",
                BODYWEIGHT: "No equipment needed",
                CARDIO: "Running, cycling, rowing"
            }
        },
        finishDialog: {
            title: "Finish Workout",
            noteLabel: "Session note (optional)",
            notePlaceholder: "How did it feel? Any PRs? Notes for next time...",
            saving: "Saving...",
            finishBtn: "Finish 🎉"
        },
        listDialog: {
            title: "Added Exercises",
            description: "Manage your custom exercises",
            loading: "Loading exercises...",
            empty: "No custom exercises added yet.",
            publicInfo: "Public",
            privateInfo: "Private",
            editHover: "Edit exercise",
            deleteHover: "Delete private exercise",
            deleteConfirm: {
                title: "Delete Custom Exercise?",
                desc1: "Are you sure you want to delete this custom exercise? This will ",
                descBold: "remove it from your library and workouts",
                desc2: ".",
                confirm: "Delete"
            }
        },
        logPastDialog: {
            titleInfo: "Log Past Workout",
            titleExercises: "Exercises & Sets",
            nameLabel: "Workout name (optional)",
            namePlaceholder: "e.g. Push Day",
            dateLabel: "Date",
            dateRequired: "Date is required",
            durationLabel: "Duration (optional)",
            restTimerLabel: "Rest Timer",
            restTimerDesc: "Record rest duration for this session",
            seconds: "seconds",
            noteLabel: "Session note (optional)",
            notePlaceholder: "How did it feel?",
            addSet: "Add set",
            addExercise: "Add Exercise",
            nextBtn: "Next",
            saveBtn: "Save Workout",
            miniPicker: {
                search: "Search exercises...",
                addCustom: "Add custom exercise"
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
            weightLab: "Weight (kg)",
            durLab: "Duration (minutes)",
            minutesPh: "Minutes",
            distLab: "Distance (km) — optional",
            kmPh: "km",
            lastPrefix: "Last: ",
            kgSuffix: " kg",
            logBtn: "Log Set"
        },
        restTimer: {
            title: "Rest Timer",
            minus15: "-15s",
            plus15: "+15s"
        },
        addDialog: {
            addTitle: "Add Custom Exercise",
            editTitle: "Edit Exercise",
            imageOptional: "Image (optional)",
            tapToUpload: "Tap to upload image",
            imageReqs: "JPEG, PNG, WebP — max 5MB",
            nameLabel: "Exercise name",
            namePlaceholder: "e.g. Cable Lateral Raise",
            nameRequired: "Exercise name is required",
            typeLabel: "Type",
            muscleGroupLabel: "Muscle Group",
            targetMuscleLabel: "Target Muscles (Optional)",
            makePublic: "Make public",
            makePublicDesc: "Share with other users",
            saveChanges: "Save Changes",
            addExerciseBtn: "Add Exercise",
            saving: "Saving...",
            adding: "Adding...",
            errorGeneric: "Something went wrong",
            publicWarning: {
                title: "Make Exercise Public?",
                desc1: "You are about to make this exercise public. Once public, it will be visible to all users and ",
                descBold: "cannot be deleted",
                desc2: ". Are you sure you want to continue?",
                confirm: "Yes, Make Public"
            },
            types: {
                WEIGHTED: "Weighted",
                BODYWEIGHT: "Bodyweight",
                CARDIO: "Cardio"
            },
            muscles: {
                CHEST: "Chest",
                BACK: "Back",
                SHOULDERS: "Shoulders",
                BICEPS: "Biceps",
                TRICEPS: "Triceps",
                FOREARMS: "Forearms",
                LEGS: "Legs",
                GLUTES: "Glutes",
                CORE: "Core",
                CARDIO: "Cardio",
                FULL_BODY: "Full Body"
            },
            targets: {
                chest: "chest",
                trapezius: "trapezius",
                "upper-back": "upper back",
                "lower-back": "lower back",
                "front-deltoids": "front deltoids",
                "back-deltoids": "back deltoids",
                biceps: "biceps",
                triceps: "triceps",
                forearm: "forearm",
                quadriceps: "quadriceps",
                hamstring: "hamstring",
                calves: "calves",
                adductor: "adductor",
                abductors: "abductors",
                gluteal: "gluteal",
                abs: "abs",
                obliques: "obliques"
            }
        }
    },
    progress: {
        title: "Progress",
        periods: {
            all: "All",
            week: "7D",
            month: "1M",
            threeMonths: "3M"
        },
        sections: {
            muscleGroups: "Muscle Groups Ranked (volume)",
            volume: "Volume Over Time",
            exercises: {
                title: "Exercise Progress",
                trackExercise: "Track exercise",
                best: "Best",
                current: "Current",
                periodDelta: "Period Δ",
                sessions: "Sessions",
                chooseExercise: "Choose Exercise",
                removeSlot: "Remove this slot",
                hint: "Tap a card to see full details · tap ✏️ to change exercise",
                repsMax: "reps max",
                volume: "Vol",
                labels: {
                    maxReps: "Max Reps",
                    distance: "Distance",
                    e1rm: "e1RM"
                }
            },
            records: {
                title: "Personal Records (top 10)",
                empty: "No PRs yet — start lifting!",
                in: "in",
                e1rm: "e1RM",
                maxReps: "Max Reps",
                best: "Best"
            },
            consistency: {
                title: "Consistency",
                weeklyGoal: "Weekly goal:",
                xPerWeek: "x / week",
                streak: "streak",
                goalMet: "Goal met this week!",
                last8weeks: "Last 8 weeks"
            }
        },
        overview: {
            workouts: "Workouts",
            totalSets: "Total Sets",
            volume: "Volume",
            avgDuration: "Avg Duration"
        },
        charts: {
            noData: "No data for this period",
            volume: {
                weekOf: "Week of",
                total: "total",
                avg: "avg",
                toggle: {
                    total: "Total",
                    muscle: "By Muscle"
                }
            },
            heatmap: {
                front: "Front",
                back: "Back",
                other: "Other",
                first: "1st",
                second: "2nd",
                third: "3rd"
            }
        }
    },
    history: {
        title: "History",
        empty: {
            selectDay: "Select a day to see your workout"
        },
        stats: {
            sets: "sets",
            volume: "kg volume"
        },
        duration: {
            hourAbbr: "h",
            minAbbr: "m"
        },
        calendar: {
            days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        },
        deleteConfirm: {
            title: "Delete Workout?",
            description: "Are you sure you want to delete this workout? This will remove all exercises and sets recorded for this session. This action cannot be undone.",
            confirm: "Delete"
        }
    },
    dashboard: {
        greetings: {
            morning: "Good morning",
            afternoon: "Good afternoon",
            evening: "Good evening",
            fallback: "there"
        },
        stats: {
            thisWeek: "This week",
            workoutCount: {
                one: "workout",
                other: "workouts"
            },
            goalMet: "Goal met",
            streak: {
                one: "week streak",
                other: "weeks streak"
            }
        },
        quickStats: {
            sets: "Sets",
            volume: "Volume",
            time: "Time",
            mostTrained: "Most Trained",
            last: "Last"
        },
        muscleStats: {
            title: "Muscles Hit This Week",
            for: "for",
            reps: "reps"
        },
        cta: {
            start: "Let's get going!"
        },
        lastWorkout: {
            title: "Last Workout",
            today: "Today",
            yesterday: "Yesterday",
            daysAgo: "{{count}}d ago"
        },
        activity: {
            title: "Activity",
            weightsIntensity: "Weights intensity",
            cardioIntensity: "Cardio / Body intensity",
            days: ["M", "T", "W", "T", "F", "S", "S"]
        }
    },
    common: {
        loading: "Loading...",
        processing: "Processing...",
        confirm: "Confirm",
        cancel: "Cancel",
        save: "Save",
        search: "Search...",
        noData: "No data"
    }
}

export type Dictionary = typeof en;
