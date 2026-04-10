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
    }
}

export type Dictionary = typeof en;
