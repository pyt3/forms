
var firestore, auth, isAuth = false
window.onload = () => {
    const firebaseConfig = {
        apiKey: "AIzaSyANRS_sanVDjdunkY8z-F5UD-n3R1rgYKQ",
        authDomain: "daily-check-form.firebaseapp.com",
        projectId: "daily-check-form",
        storageBucket: "daily-check-form.appspot.com",
        messagingSenderId: "544837049860",
        appId: "1:544837049860:web:462e6b854290b1dec39f51"
    };
    const defaultProject = firebase.initializeApp(firebaseConfig);
    console.log(defaultProject.name);  // "[DEFAULT]"
    firestore = defaultProject.firestore();
    auth = defaultProject.auth();
    liff.init({ liffId: '1657104960-953rK3wq' })
    liff.ready.then(async () => {
        if (!liff.isLoggedIn()) {
            return liff.login()
        }
        getAuth(await liff.getDecodedIDToken().sub)
        scancode()
    })

}

var liffId = {
    defibrillator: '1657104960-wXQRkQ87',
    incubator: '1657104960-w9greg5D',
    temperature: '1657104960-92R4ZRQz',
    monitorbedside: '1657104960-p9V0QVJx'
}

async function getAuth(uid) {
    let email = uid + '@dailycheck.com'
    let password = 'dailycheck'
    return await auth.signInWithEmailAndPassword(email, password).then(function (user) {
        isAuth = true
        console.log('sign in successful')
    }).catch(async function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        // var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        console.log(errorCode)
        console.log(errorMessage)
        console.log(credential)
        await auth.createUserWithEmailAndPassword(email, password).then(function (user) {
            console.log('sign up successful')
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
function scancode() {
    let os = liff.getOS()
    if (os == 'ios' || os == 'web') {
        liff.scanCodeV2()
            .then((result) => {
                getdata(result)
            })
    } else if (os == 'android') {
        liff.scanCode()
            .then((result) => {
                getdata(result)
            })
    }
}

async function getdata(result) {
    const id = result.value.split('=')[1];

    // wait for auth without busy-waiting
    if (!isAuth) {
        await new Promise((resolve) => {
            const check = setInterval(() => {
                if (isAuth) {
                    clearInterval(check);
                    resolve();
                }
            }, 100);
        });
    }

    const collections = [
        { name: 'PYT3_e', client: 'PYT3' },
        { name: 'PYT2_e', client: 'PYT2' },
        { name: 'PYT1_e', client: 'PYT1' },
        { name: 'PLP_e', client: 'PLP' },
        { name: 'SNH_e', client: 'SNH' },
        { name: 'DEMO_e', client: 'DEMO' },
        { name: 'PLS_e', client: 'PLS' }
    ];

    const buildAndOpen = (client, d) => {
        const url = new URL('line://app/' + liffId[d.form]);
        url.searchParams.set("client", client);
        url.searchParams.set("id", d.code);
        url.searchParams.set("name", d.name);
        url.searchParams.set("dept", d.dept);
        url.searchParams.set("brand", d.brand);
        url.searchParams.set("model", d.model);
        if (d.form === 'temperature') {
            url.searchParams.set("min", d.min);
            url.searchParams.set("max", d.max);
            url.searchParams.set("min2", d.min2);
            url.searchParams.set("max2", d.max2);
            url.searchParams.set("nid", id);
            url.searchParams.set("checkShelf", d.checkShelf);
        }
        window.open(url, '_self');
    };

    try {
        for (const col of collections) {
            try {
                const doc = await firestore.collection(col.name).doc(id).get();
                if (!doc.exists) continue;
                const d = doc.data();
                if (!d || !d.form) continue;
                if (liffId[d.form]) {
                    buildAndOpen(col.client, d);
                    return;
                }
            } catch (err) {
                console.error(err);
                liff.closeWindow();
                return;
            }
        }

        // not found in any collection
        Swal.fire({
            icon: 'warning',
            title: 'ไม่พบข้อมูล หรือท่านอาจเลือกชนิดเครื่องมือไม่ถูกต้อง',
            confirmButtonText: 'แสกนอีกครั้ง',
            cancelButtonText: 'ปิดหน้าต่าง',
            showCancelButton: true,
        }).then(result => {
            if (result.isConfirmed) {
                scancode();
            } else {
                liff.closeWindow();
            }
        });
    } catch (err) {
        console.error(err);
        liff.closeWindow();
    }
}
