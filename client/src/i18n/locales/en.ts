export const en = {
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
        }
    }
}

export type Dictionary = typeof en;
