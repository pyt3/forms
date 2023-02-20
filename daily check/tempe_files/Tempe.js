Swal.fire({
    icon: 'info',
    title: '0%',
    html: 'กำลังสร้างรายงาน',
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
})
var testobj = JSON.parse(localStorage.getItem('report_obj'))
// console.log("🚀 ~ testobj", testobj)
// var testobj = {
//     "DAY": {
//         "1/2/2566": {
//             "e_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "e_brand": "SANYO",
//             "signature_manager": "https://drive.google.com/uc?id=1lieo4sMKweNauFTdN4H7ZDoqxlVFdeQi",
//             "e_name": "REFRIGERATORS",
//             "time": 1675219639367,
//             "rec_remark": "ตู้เย็นเก็บน้ำเกลือแช่แข็ง",
//             "e_model": "SR-152BNL",
//             "shift": "DAY",
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "temp": 2.5,
//             "approve_time": 1675222787149,
//             "e_code": "PYT1_05664",
//             "rec_name": "อภิรดี",
//             "max": 8,
//             "signature_staff": "https://drive.google.com/uc?id=151QoU2I4wZVmofr5LEKvYXLrafKOxZTW",
//             "min": 2,
//             "form": "temperature",
//             "approve_name": "Warapa",
//             "date": "1/2/2566",
//             "firestore_id": "eK7SYYmKo1kOZYzE1EpV"
//         },
//         "4/2/2566": {
//             "e_dept": "Operating+Room+(OR)ห้องผ่าตัด",
//             "e_brand": "SANYO",
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "time": 1675521565597,
//             "approve_name": "Warapa",
//             "date": "4/2/2566",
//             "signature_staff": "https://drive.google.com/uc?id=1S2YUU-7s3LNXTCyo6E1MmC905b4wLC2K",
//             "e_model": "SR-152BNL",
//             "max": 8,
//             "shift": "DAY",
//             "form": "temperature",
//             "rec_remark": "",
//             "signature_manager": "https://drive.google.com/uc?id=16xZljeBFVJwAitNEuVBQSlQmpenVeNqU",
//             "temp": 4,
//             "approve_time": 1675555092347,
//             "e_name": "REFRIGERATORS",
//             "rec_name": "นส นฤมลสุภาเนตร",
//             "min": 2,
//             "e_code": "PYT1_05664",
//             "firestore_id": "S0scAvcrIozSqnYeCTn8"
//         },
//         "8/2/2566": {
//             "shift": "DAY",
//             "e_code": "PYT1_05664",
//             "e_brand": "SANYO",
//             "time": 1675861796092,
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "approve_time": 1675921736460,
//             "approve_name": "Warapa",
//             "signature_staff": "https://drive.google.com/uc?id=1EOFW-pubabidOlRzodF2rVP15FLS0lKC",
//             "temp": 3,
//             "e_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "rec_remark": "ตู้เย็นเก็บน้ำเกลือแช่แข็ง",
//             "e_name": "REFRIGERATORS",
//             "e_model": "SR-152BNL",
//             "rec_name": "อภิรดี",
//             "min": 2,
//             "form": "temperature",
//             "signature_manager": "https://drive.google.com/uc?id=1P5BCBaxatX8rCKaBvLd8kXHLa_ilpCCo",
//             "max": 8,
//             "date": "8/2/2566",
//             "firestore_id": "ibmmvDCVvfjDBZKS9dwF"
//         },
//         "9/2/2566": {
//             "e_model": "SR-152BNL",
//             "e_name": "REFRIGERATORS",
//             "e_code": "PYT1_05664",
//             "e_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "temp": 3,
//             "date": "9/2/2566",
//             "rec_remark": "ตู้เย็นเก็บน้ำเกลือแช่แข็ง",
//             "time": 1675931866533,
//             "rec_name": "อภิรดี",
//             "approve_time": 1676012660606,
//             "form": "temperature",
//             "min": 2,
//             "approve_name": "Warapa",
//             "max": 8,
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "e_brand": "SANYO",
//             "signature_staff": "https://drive.google.com/uc?id=19TZ1AW6DfshofSBOd--2EoPiSHWSl7n-",
//             "shift": "DAY",
//             "signature_manager": "https://drive.google.com/uc?id=1Vvc7S_nlL0Q_PNPSEE2d2IQQHtaE7oY3",
//             "firestore_id": "rAIggYq2if31GO6JmAO9"
//         },
//         "10/2/2566": {
//             "approve_time": 1676093467347,
//             "rec_remark": "",
//             "e_code": "PYT1_05664",
//             "temp": 4.3,
//             "signature_staff": "https://drive.google.com/uc?id=1yToA-KosXWFeJvGlso-EAyVGjkCXI9SY",
//             "e_name": "REFRIGERATORS",
//             "form": "temperature",
//             "shift": "DAY",
//             "date": "10/2/2566",
//             "rec_name": "Jakkree",
//             "max": 8,
//             "signature_manager": "https://drive.google.com/uc?id=18GmP3NT0LFkStXe1GvdGJ2g97WcBzQih",
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "approve_name": "Warapa",
//             "e_model": "SR-152BNL",
//             "min": 2,
//             "e_brand": "SANYO",
//             "time": 1676016669577,
//             "e_dept": "Operating+Room+(OR)ห้องผ่าตัด",
//             "firestore_id": "KPuUluJjc6ZT1120YcXr"
//         },
//         "11/2/2566": {
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "e_model": "SR-152BNL",
//             "signature_manager": "https://drive.google.com/uc?id=1dHZYBO0l8_cV_GGq3CWBLx1pGn6gYZ3Y",
//             "e_code": "PYT1_05664",
//             "rec_remark": "",
//             "e_name": "REFRIGERATORS",
//             "e_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "form": "temperature",
//             "signature_staff": "https://drive.google.com/uc?id=1-2VPC9bWsBt5EAWj9ys0-NhYOoux7MpW",
//             "rec_name": "อมรรัตน์",
//             "time": 1676081895295,
//             "temp": -3,
//             "approve_time": 1676093515227,
//             "shift": "DAY",
//             "approve_name": "Warapa",
//             "date": "11/2/2566",
//             "e_brand": "SANYO",
//             "min": 2,
//             "max": 8,
//             "firestore_id": "u0qZqQPjzV7zWFUeDg8I"
//         },
//         "18/2/2566": {
//             "rec_name": "วิชัย",
//             "rec_remark": "",
//             "e_code": "PYT1_05664",
//             "e_model": "SR-152BNL",
//             "temp": 3,
//             "shift": "DAY",
//             "e_brand": "SANYO",
//             "time": 1676715855160,
//             "e_name": "REFRIGERATORS",
//             "form": "temperature",
//             "date": "18/2/2566",
//             "max": 8,
//             "e_dept": "Operating+Room+(OR)ห้องผ่าตัด",
//             "min": 2,
//             "rec_dept": null,
//             "signature_staff": "https://drive.google.com/uc?id=1rg2Gpd_PBhrIwjuIcbQleEV-EYADFPJ6",
//             "firestore_id": "bIJdLj0IZw717BrLj3C0"
//         },
//         "19/2/2566": {
//             "min": 2,
//             "shift": "DAY",
//             "e_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "form": "temperature",
//             "date": "19/2/2566",
//             "time": 1676803825589,
//             "e_code": "PYT1_05664",
//             "signature_staff": "https://drive.google.com/uc?id=14zAYFzAwW4XkOpWIKGW1L8H0E_pjaIvU",
//             "e_model": "SR-152BNL",
//             "e_brand": "SANYO",
//             "rec_name": "เนตรนภา",
//             "max": 8,
//             "rec_remark": "Nss",
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "e_name": "REFRIGERATORS",
//             "temp": 3,
//             "firestore_id": "0NavvWML0RkKqAl7Xgcd"
//         },
//         "20/2/2566": {
//             "form": "temperature",
//             "rec_dept": "Anesthesia(ANES)แผนกวิสัญญี",
//             "date": "20/2/2566",
//             "temp": 5,
//             "time": 1676879626231,
//             "e_name": "REFRIGERATORS",
//             "rec_remark": "",
//             "e_model": "SR-152BNL",
//             "e_brand": "SANYO",
//             "rec_name": "Test",
//             "min": 2,
//             "signature_staff": "https://drive.google.com/uc?id=1HMEnb3PqA604Y1ZHo9mmODrlgrTLLU_1",
//             "shift": "DAY",
//             "max": 8,
//             "e_code": "PYT1_05664",
//             "e_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "firestore_id": "Bl25t97FOT4mY4mB1tU6"
//         }
//     },
//     "NIGHT": {
//         "1/2/2566": {
//             "temp": 2.5,
//             "time": 1675247409671,
//             "rec_name": "อภิรดี",
//             "e_code": "PYT1_05664",
//             "approve_name": "Warapa",
//             "max": 8,
//             "form": "temperature",
//             "date": "1/2/2566",
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "e_name": "REFRIGERATORS",
//             "approve_time": 1675258371475,
//             "signature_staff": "https://drive.google.com/uc?id=1abqVI2gB2Im6HgfWW5Aw_dDH8701TmYw",
//             "e_model": "SR-152BNL",
//             "rec_remark": "ตู้เย็นเก็บน้ำเกลือแช่แข็ง",
//             "e_brand": "SANYO",
//             "shift": "NIGHT",
//             "min": 2,
//             "e_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "signature_manager": "https://drive.google.com/uc?id=1IdxZS1CKCmE1ZfIKV5Ov0pHNFlmE8hIb",
//             "firestore_id": "bdJuJWCquMatLuPKEZh3"
//         },
//         "2/2/2566": {
//             "rec_name": "นส นฤมลสุภาเนตร",
//             "shift": "NIGHT",
//             "approve_name": "Warapa",
//             "temp": 4,
//             "e_brand": "SANYO",
//             "time": 1675297839198,
//             "min": 2,
//             "signature_manager": "https://drive.google.com/uc?id=1CEHhgSVf1Glj6iBTIleHIZKez7Fo6nVj",
//             "e_name": "REFRIGERATORS",
//             "approve_time": 1675334745916,
//             "form": "temperature",
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "max": 8,
//             "e_code": "PYT1_05664",
//             "signature_staff": "https://drive.google.com/uc?id=1su0-lCmn6UEuiY65vDvU6_J2qfj4rmkB",
//             "date": "2/2/2566",
//             "e_model": "SR-152BNL",
//             "rec_remark": "",
//             "e_dept": "Operating+Room+(OR)ห้องผ่าตัด",
//             "firestore_id": "O0VSPQcyoGrYonXkfDAh"
//         },
//         "3/2/2566": {
//             "e_code": "PYT1_05664",
//             "min": 2,
//             "e_model": "SR-152BNL",
//             "rec_remark": "",
//             "rec_name": "นส นฤมลสุภาเนตร",
//             "signature_manager": "https://drive.google.com/uc?id=1CuO61Vouloke61dYhKUlmWgJF6HXVCFk",
//             "e_dept": "Operating+Room+(OR)ห้องผ่าตัด",
//             "time": 1675385143268,
//             "max": 8,
//             "form": "temperature",
//             "approve_name": "Warapa",
//             "signature_staff": "https://drive.google.com/uc?id=1-ziqnUCaajCWkSDw3-NNzw4RpS6KzgP-",
//             "approve_time": 1675434620966,
//             "date": "3/2/2566",
//             "e_name": "REFRIGERATORS",
//             "shift": "NIGHT",
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "e_brand": "SANYO",
//             "temp": 4,
//             "firestore_id": "oVLyYlUJw3lKcwtSeHSd"
//         },
//         "5/2/2566": {
//             "signature_manager": "https://drive.google.com/uc?id=1Kr55FBn9jrAfUzLvPlDZ80e7xIc-kGkD",
//             "rec_name": "วิชัย",
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "time": 1675595293133,
//             "date": "5/2/2566",
//             "approve_name": "Warapa",
//             "signature_staff": "https://drive.google.com/uc?id=1nIZXEa8RoGSMWonVE1KJLiXj76IOJEpM",
//             "approve_time": 1675602712422,
//             "min": 2,
//             "e_code": "PYT1_05664",
//             "temp": 2.8,
//             "e_brand": "SANYO",
//             "form": "temperature",
//             "shift": "NIGHT",
//             "rec_remark": "",
//             "e_model": "SR-152BNL",
//             "e_dept": "Operating+Room+(OR)ห้องผ่าตัด",
//             "max": 8,
//             "e_name": "REFRIGERATORS",
//             "firestore_id": "42ZGoZase5ytrPQJlrmK"
//         },
//         "6/2/2566": {
//             "time": 1675663833569,
//             "e_brand": "SANYO",
//             "max": 8,
//             "signature_staff": "https://drive.google.com/uc?id=1gTy7NDTs32RCwyDaslCCg57k-0DWrnNx",
//             "approve_time": 1675680151481,
//             "date": "6/2/2566",
//             "min": 2,
//             "rec_remark": "",
//             "form": "temperature",
//             "approve_name": "Warapa",
//             "e_code": "PYT1_05664",
//             "temp": 2.8,
//             "signature_manager": "https://drive.google.com/uc?id=1_pJj6XrYt3JFToMTbJMMTrUeRCV7z1ZL",
//             "e_dept": "Operating+Room+(OR)ห้องผ่าตัด",
//             "shift": "NIGHT",
//             "rec_name": "Jakkree",
//             "e_name": "REFRIGERATORS",
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "e_model": "SR-152BNL",
//             "firestore_id": "1Ixqv1lJiftz8FFILsbq"
//         },
//         "7/2/2566": {
//             "e_brand": "SANYO",
//             "e_dept": "Operating+Room+(OR)ห้องผ่าตัด",
//             "min": 2,
//             "signature_manager": "https://drive.google.com/uc?id=10zu6OAbXIomwynntC-KbIpqJpDE2Hvme",
//             "time": 1675761799452,
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "shift": "NIGHT",
//             "approve_name": "Warapa",
//             "date": "7/2/2566",
//             "e_model": "SR-152BNL",
//             "signature_staff": "https://drive.google.com/uc?id=1v7crE1qi-Pjvq9JjKO_eQ9z-rMLwU6Gt",
//             "rec_remark": "",
//             "temp": 3.4,
//             "e_code": "PYT1_05664",
//             "e_name": "REFRIGERATORS",
//             "rec_name": "Jakkree",
//             "max": 8,
//             "form": "temperature",
//             "approve_time": 1675762967942,
//             "firestore_id": "SJHAxPghghLzpG3qm3Sc"
//         },
//         "11/2/2566": {
//             "e_code": "PYT1_05664",
//             "e_brand": "SANYO",
//             "signature_manager": "https://drive.google.com/uc?id=1Z7citJqkFtvdgduQvXktv_y03wxb3vkC",
//             "rec_name": "อมรรัตน์",
//             "time": 1676101698165,
//             "form": "temperature",
//             "min": 2,
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "e_model": "SR-152BNL",
//             "approve_time": 1676189590129,
//             "e_name": "REFRIGERATORS",
//             "shift": "NIGHT",
//             "signature_staff": "https://drive.google.com/uc?id=1lX3MaMqsjEDbEbEK7ZdQtxTnCfICDMfa",
//             "temp": -3,
//             "approve_name": "Warapa",
//             "max": 8,
//             "date": "11/2/2566",
//             "e_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "rec_remark": "",
//             "firestore_id": "LWGb1AraaMDvHmuj1DeK"
//         },
//         "12/2/2566": {
//             "date": "12/2/2566",
//             "approve_name": "Warapa",
//             "min": 2,
//             "signature_manager": "https://drive.google.com/uc?id=1aYhd6LE2NrhBAptcYCObAZh-VuQ_I7Zp",
//             "time": 1676190795898,
//             "e_model": "SR-152BNL",
//             "shift": "NIGHT",
//             "e_brand": "SANYO",
//             "rec_remark": "ตู้เย็บเก็บนํ้าเกลือ",
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "temp": 3,
//             "e_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "max": 8,
//             "e_code": "PYT1_05664",
//             "approve_time": 1676193059684,
//             "signature_staff": "https://drive.google.com/uc?id=1-n2kNfp-R0ljVNrmX8li7P44-byTQc1B",
//             "rec_name": "ศรินลา",
//             "form": "temperature",
//             "e_name": "REFRIGERATORS",
//             "firestore_id": "ISLRYlstz7wkRnooh1Xf"
//         },
//         "13/2/2566": {
//             "temp": 2,
//             "e_model": "SR-152BNL",
//             "shift": "NIGHT",
//             "form": "temperature",
//             "min": 2,
//             "approve_name": "Warapa",
//             "max": 8,
//             "e_brand": "SANYO",
//             "date": "13/2/2566",
//             "e_code": "PYT1_05664",
//             "rec_name": "เรือง สิริ",
//             "rec_remark": "",
//             "e_name": "REFRIGERATORS",
//             "signature_manager": "https://drive.google.com/uc?id=1Iami_lfHR-PSBNoaIBeRlWGy0SHjTZAl",
//             "time": 1676275199419,
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "approve_time": 1676276643488,
//             "e_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "signature_staff": "https://drive.google.com/uc?id=1-J6amcoqjVqCm9J1VBY4rQhmgTi3H6Vb",
//             "firestore_id": "IKSaX5hm3Awjd7o3DUGY"
//         },
//         "14/2/2566": {
//             "rec_remark": "",
//             "e_code": "PYT1_05664",
//             "temp": 2,
//             "e_model": "SR-152BNL",
//             "signature_manager": "https://drive.google.com/uc?id=1Rep_Z5fcLwF2Iap5QAPkFv6-7MvNES1q",
//             "rec_name": "เรืองสิริ",
//             "signature_staff": "https://drive.google.com/uc?id=1sGYP9zp5C2jwV-T8tV0-UQ5oUXNFKBAi",
//             "approve_name": "Warapa",
//             "max": 8,
//             "e_brand": "SANYO",
//             "min": 2,
//             "approve_time": 1676386755039,
//             "shift": "NIGHT",
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "time": 1676347291347,
//             "e_name": "REFRIGERATORS",
//             "date": "14/2/2566",
//             "e_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "form": "temperature",
//             "firestore_id": "Wv4K3bWgPldD3LdgoDzn"
//         },
//         "15/2/2566": {
//             "max": 8,
//             "shift": "NIGHT",
//             "date": "15/2/2566",
//             "e_name": "REFRIGERATORS",
//             "e_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "signature_manager": "https://drive.google.com/uc?id=1TEE5ZH2Qd4xRewmGyIEn9_7p3Pkjbg0l",
//             "e_brand": "SANYO",
//             "approve_time": 1676460443988,
//             "rec_remark": "",
//             "signature_staff": "https://drive.google.com/uc?id=1cpJFMEfSrgxSUrdpbzhJqV9aAMyDKicr",
//             "form": "temperature",
//             "time": 1676450832294,
//             "temp": 2.3,
//             "e_code": "PYT1_05664",
//             "min": 2,
//             "rec_name": "เรืองสิริ",
//             "e_model": "SR-152BNL",
//             "approve_name": "Warapa",
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "firestore_id": "HSZzUNgSEqb0lTqd2LFt"
//         },
//         "16/2/2566": {
//             "approve_name": "Warapa",
//             "min": 2,
//             "time": 1676525343866,
//             "e_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "e_brand": "SANYO",
//             "form": "temperature",
//             "approve_time": 1676641368971,
//             "rec_name": "โยธะกา",
//             "date": "16/2/2566",
//             "temp": 3,
//             "shift": "NIGHT",
//             "e_name": "REFRIGERATORS",
//             "e_model": "SR-152BNL",
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "signature_manager": "https://drive.google.com/uc?id=1WGJxE8ReAMYDqc78fHhkDsZ7OOfaMrqq",
//             "signature_staff": "https://drive.google.com/uc?id=1GLky5cErGZ38xceN_-nRCcWoqU1FEnO9",
//             "rec_remark": "Nss",
//             "e_code": "PYT1_05664",
//             "max": 8,
//             "firestore_id": "ROnv7kuM5b6BN2IMLnZW"
//         },
//         "17/2/2566": {
//             "approve_time": 1676641474891,
//             "e_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "rec_name": "อภิรดี",
//             "shift": "NIGHT",
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "time": 1676640749095,
//             "e_name": "REFRIGERATORS",
//             "date": "17/2/2566",
//             "temp": 4.2,
//             "rec_remark": "ตฟุ้เย็นเก็บน้ำเกลือเเช่แข็ง",
//             "e_brand": "SANYO",
//             "min": 2,
//             "approve_name": "Warapa",
//             "e_model": "SR-152BNL",
//             "max": 8,
//             "e_code": "PYT1_05664",
//             "signature_staff": "https://drive.google.com/uc?id=1K2STJK_rpkzhJkiMTcrShgtt2NCK_Ewb",
//             "signature_manager": "https://drive.google.com/uc?id=1d2QvhDwUVlMMDtLe6hTCeBVrLipR9N7I",
//             "form": "temperature",
//             "firestore_id": "TqsLxdSfhrRSgN8jecj3"
//         },
//         "19/2/2566": {
//             "approve_time": 1676800953485,
//             "approve_name": "Warapa",
//             "rec_remark": "",
//             "temp": 3,
//             "time": 1676769234539,
//             "min": 2,
//             "signature_manager": "https://drive.google.com/uc?id=1wuYslZWfuCBwsuVQ8IPir_ekBbX7j7YI",
//             "signature_staff": "https://drive.google.com/uc?id=1pzGGEtvSqOMxO2twpFl5lFTCdCDR6Ztu",
//             "date": "19/2/2566",
//             "rec_dept": "Operating Room (OR)ห้องผ่าตัด",
//             "e_code": "PYT1_05664",
//             "rec_name": "Nate",
//             "form": "temperature",
//             "e_name": "REFRIGERATORS",
//             "shift": "NIGHT",
//             "e_dept": "Operating+Room+(OR)ห้องผ่าตัด",
//             "max": 8,
//             "e_model": "SR-152BNL",
//             "e_brand": "SANYO",
//             "firestore_id": "zjo0hHa2QXJamDugU1Lm"
//         }
//     }
// }
var tempkey = Object.keys(testobj['DAY'])[0]



var e_code = testobj['DAY'][tempkey].e_code
var e_brand = testobj['DAY'][tempkey].e_brand
var e_model = testobj['DAY'][tempkey].e_model
var e_dept = testobj['DAY'][tempkey].e_dept
console.log("🚀 ~ e_dept", e_dept)
var month = new Date(testobj['DAY'][tempkey].time).toLocaleString('en-En', { month: 'long' })
var month_num = new Date(testobj['DAY'][tempkey].time).getMonth() + 1
var year = new Date(testobj['DAY'][tempkey].time).getFullYear()
var year_bd = year + 543
var q_key = {
    1: "daily-check-system",
    2: 'daily-check-switch',
    3: 'daily-check-paddle',
    4: 'daily-check-ekg',
    5: 'daily-check-adhesive',
    6: 'daily-check-reddot',
    7: 'daily-check-transmissiongel',
    8: 'daily-check-ekgpaper',
    9: 'daily-check-cord',
    10: 'daily-check-time',
    11: 'daily-check-power',
    12: 'afteruse-check-battery',
    13: 'afteruse-check-clean',
    staff: 'signature_staff',
    manager: 'signature_manager',
    staff_afteruse: 'signature_staff_afteruse',
    manager_afteruse: 'signature_manager_afteruse',
}

$(document).ready(() => {
    $('#month').text(month)
    $('#year').text(year_bd)
    $('#dept').text(e_dept)
    $('#refrig-no').text(e_code)
    let weeknum = 1
    let week_check = {}
    if (testobj['DAY']) {
        Object.keys(testobj['DAY']).forEach(key => {
            console.log("🚀 ~ key:", key)
            let date = ('00' + key.split('/')[0]).slice(-2)
            let point = getClostestPoint(testobj['DAY'][key].temp)
            let key_point = `${point}-${date}-d`
            $('[id="'+key_point+'"]').text('✘')
            $('[id="sign-'+date+'-d"]').attr('src', testobj['DAY'][key].signature_staff).show()
        })
    }
    if (testobj['NIGHT']) {
        Object.keys(testobj['NIGHT']).forEach(key => {
            console.log("🚀 ~ key:", key)
            let date = ('00' + key.split('/')[0]).slice(-2)
            let point = getClostestPoint(testobj['NIGHT'][key].temp)
            let key_point = `${point}-${date}-n`
            $('[id="'+key_point+'"]').text('✘')
            $('[id="sign-'+date+'-n"]').attr('src', testobj['NIGHT'][key].signature_staff).show()
        })
    }


    let imgs = document.querySelectorAll('.isloading')
    let len = imgs.length
    console.log("🚀 ~ len", len)
    let count = 0
    imgs.forEach(function (img) {
        if (img.complete) incrementCounter();
        else img.addEventListener('load', incrementCounter, false);
    })

    function incrementCounter() {
        count++;
        Swal.update({
            title: Math.floor(count / len * 100) + '%'
        })
        if (count === len) {
            setTimeout(() => {
                Swal.close()
                // setTimeout(() => { window.print() }, 1000)

            }, 200);
        }
    }
})

function getClostestPoint(temp) {
    let upper = Math.ceil(Number(temp))
    let lower = Math.floor(Number(temp))
    let middle = (upper + lower) / 2
    let closest = 100
    new Array(upper, lower, middle).forEach(a => {
        if (Math.abs(a - temp) <= closest) {
            closest = a
        }
    })
    return closest
}

function mapSign(text) {
    switch (text) {
        case "ผ่าน":
            return "✔"
        case "ไม่ผ่าน":
            return "✘"
        case "N/A":
            return "-"
        default:
            return ''
    }
}