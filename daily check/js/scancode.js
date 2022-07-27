
var firestore
window.onload = () => {
    fetchInject(['"../js/getFirebaseAuth.js?cache=' + new Date().getTime() + '"'])
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

}
liff.init({ liffId: '1657104960-953rK3wq' })
liff.ready.then(async () => {
    if (!liff.isLoggedIn()) {
        return liff.login()
    }
    await getAuth(await liff.getProfile().userId)
    scancode()
})
var liffId = {
    defibrillator: '1657104960-wXQRkQ87',
    incubator: '1657104960-w9greg5D',
    temperature: '1657104960-92R4ZRQz',
    monitorbedside: '1657104960-p9V0QVJx'
}
function scancode() {
    let os = liff.getOS()
    if (os == 'ios' || os == 'web') {
        liff.scanCodeV2()
            .then((result) => {
                getdata(result)
            })
    } else if (os == 'android') {
        liff.scanCodeV2()
            .then((result) => {
                getdata(result)
            })
    }
}

function getdata(result) {
    let id = result.value.split('=')[1]
    firestore.collection('PYT3_e').doc(id).get().then(docs => {
        let d = docs.data()
        if (docs.exists && liffId[d.form]) {
            // let url = new URL('https://liff.line.me/' + liffId[d.form])
            let url = new URL('line://app/' + liffId[d.form])
            // let url = new URL('https://liff.line.me/1655873446-gp23vvmV')
            // let url = new URL('https://pyt3.github.io/forms/daily%20check/forms/' + d.form + '?' + new Date().getTime())
            url.searchParams.set("client", 'PYT3')
            url.searchParams.set("id", d.code)
            url.searchParams.set("name", d.name)
            url.searchParams.set("dept", d.dept)
            url.searchParams.set("brand", d.brand)
            url.searchParams.set("model", d.model)
            if (d.form == 'temperature') {
                url.searchParams.set("mintemp", d.mintemp)
                url.searchParams.set("maxtemp", d.maxtemp)
            }
            //url = `${url}?id=${id}&name=${d.name}&dept=${d.dept}&model=${d.model}&brand=${d.brand}`
            // 
            // liff.closeWindow()
            window.open(url, '_self')
        } else {
            firestore.collection('PYT2_e').doc(id).get().then(docs => {
                let d = docs.data()
                if (docs.exists && liffId[d.form]) {
                    // let url = new URL('https://liff.line.me/' + liffId[d.form])
                    let url = new URL('line://app/' + liffId[d.form])
                    // let url = new URL('https://liff.line.me/1655873446-gp23vvmV')
                    // let url = new URL('https://pyt3.github.io/forms/daily%20check/forms/' + d.form + '?' + new Date().getTime())
                    url.searchParams.set("client", 'PYT2')
                    url.searchParams.set("id", d.code)
                    url.searchParams.set("name", d.name)
                    url.searchParams.set("dept", d.dept)
                    url.searchParams.set("brand", d.brand)
                    url.searchParams.set("model", d.model)
                    if (d.form == 'temperature') {
                        url.searchParams.set("mintemp", d.mintemp)
                        url.searchParams.set("maxtemp", d.maxtemp)
                    }
                    //url = `${url}?id=${id}&name=${d.name}&dept=${d.dept}&model=${d.model}&brand=${d.brand}`
                    // 
                    // liff.closeWindow()
                    window.open(url, '_self')
                } else {
                    firestore.collection('PYT1_e').doc(id).get().then(docs => {
                        let d = docs.data()
                        if (docs.exists && liffId[d.form]) {
                            // let url = new URL('https://liff.line.me/' + liffId[d.form])
                            let url = new URL('line://app/' + liffId[d.form])
                            // let url = new URL('https://liff.line.me/1655873446-gp23vvmV')
                            // let url = new URL('https://pyt3.github.io/forms/daily%20check/forms/' + d.form + '?' + new Date().getTime())
                            url.searchParams.set("client", 'PYT1')
                            url.searchParams.set("id", d.code)
                            url.searchParams.set("name", d.name)
                            url.searchParams.set("dept", d.dept)
                            url.searchParams.set("brand", d.brand)
                            url.searchParams.set("model", d.model)
                            if (d.form == 'temperature') {
                                url.searchParams.set("mintemp", d.mintemp)
                                url.searchParams.set("maxtemp", d.maxtemp)
                            }
                            //url = `${url}?id=${id}&name=${d.name}&dept=${d.dept}&model=${d.model}&brand=${d.brand}`
                            // 
                            // liff.closeWindow()
                            window.open(url, '_self')
                        } else {
                            firestore.collection('PLP_e').doc(id).get().then(docs => {
                                let d = docs.data()
                                if (docs.exists && liffId[d.form]) {
                                    // let url = new URL('https://liff.line.me/' + liffId[d.form])
                                    let url = new URL('line://app/' + liffId[d.form])
                                    // let url = new URL('https://liff.line.me/1655873446-gp23vvmV')
                                    // let url = new URL('https://pyt3.github.io/forms/daily%20check/forms/' + d.form + '?' + new Date().getTime())
                                    url.searchParams.set("client", 'PLP')
                                    url.searchParams.set("id", d.code)
                                    url.searchParams.set("name", d.name)
                                    url.searchParams.set("dept", d.dept)
                                    url.searchParams.set("brand", d.brand)
                                    url.searchParams.set("model", d.model)
                                    if (d.form == 'temperature') {
                                        url.searchParams.set("mintemp", d.mintemp)
                                        url.searchParams.set("maxtemp", d.maxtemp)
                                    }
                                    //url = `${url}?id=${id}&name=${d.name}&dept=${d.dept}&model=${d.model}&brand=${d.brand}`
                                    // 
                                    // liff.closeWindow()
                                    window.open(url, '_self')
                                } else {
                                    Swal.fire({
                                        icon: 'warning',
                                        title: 'ไม่พบข้อมูล หรือท่านอาจเลือกชนิดเครื่องมือไม่ถูกต้อง',
                                        confirmButtonText: 'แสกนอีกครั้ง',
                                        cancelButtonText: 'ปิดหน้าต่าง',
                                        showCancelButton: true,
                                    }).then(result => {
                                        if (result.isConfirmed) {
                                            scancode()
                                        } else {
                                            liff.closeWindow()
                                        }
                                    })
                                }
                            })
                                .catch((err) => {
                                    console.log(err);
                                    liff.closeWindow()
                                });
                        }
                    })
                        .catch((err) => {
                            console.log(err);
                            liff.closeWindow()
                        });
                }
            })
                .catch((err) => {
                    console.log(err);
                    liff.closeWindow()
                });
        }
    })
        .catch((err) => {
            console.log(err);
            liff.closeWindow()
        });
}