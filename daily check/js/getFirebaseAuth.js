

async function getAuth(uid) {
    let auth = firebase.auth()
    let email = uid + '@dailycheck.com'
    let password = 'dailycheck'
    await auth.signInWithEmailAndPassword(email, password).then(function (user) {

        console.log('sign in successful')
        let user = user.user
        console.log("🚀 ~ user", user)
    }).catch(async function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        console.log(errorCode)
        console.log(errorMessage)
        console.log(email)
        console.log(credential)
        await auth.createUserWithEmailAndPassword(email, password).then(function (user) {
            console.log('sign up successful')
            let user = user.user
            console.log("🚀 ~ user", user)
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
            console.log(errorCode)
            console.log(errorMessage)
            console.log(email)
            console.log(credential)
        });
    });
}