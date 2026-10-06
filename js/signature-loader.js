/**
 * signature-loader.js
 * โหลดลายเซ็นพนักงานจาก Google Drive
 *
 * วิธีใช้:
 *   const buf = await SignatureLoader.fetchArrayBuffer('ANUPHAB_CHANTO')
 *   const url = SignatureLoader.getUrl('ANUPHAB_CHANTO')
 */

const SignatureLoader = (() => {
  const DRIVE_BASE_PREFIX = 'https://drive.usercontent.google.com/download?id=';
  const DRIVE_BASE_SUFFIX = '&export=view&authuser=0';

  // mapping: ชื่อพนักงาน (UPPERCASE_UNDERSCORE) → Google Drive File ID
  const SIGNATURE_IDS = {
    'ANUPHAB_CHANTO':              '1U2xGpbzHMWWFIXNLDUqCvCwgtVLNAqQc',
    'BOONYAWAT_AIEMPHANG':         '10flxiBoiYYLQsAc-6sNsGjB87Qpajjcs',
    'CHAIWAT_SALAIWONG':           '1CW251_6qTWzfPrUUHwKLd5M_0Jfu9tyy',
    'CHALERMPORN_SABUA':           '17PJhHxRaIbcx36BWqrDMEnxnANj3XMDc',
    'CHANCHAI_SAE-LEE':            '1ryfz6PS1Dba2MzKU5MSSw1Nm3ZGLYq0E',
    'CHATMANEE_MONGKOLTANANON':    '1gX1aVudrk6ehBnwpIJpDOgXHb_7sOBha',
    'CHATVIPA_KAEWPRESERT':        '1ZX1LcaAMqDrJMHApscTyI082OAtq4ZCm',
    'CHUTIKAN_DEENUSON':           '1EKBTptsgyGH58zAMR2fPOqXqvaUV-9Mm',
    'DARANPHOP_YIMYAM':            '1ffDvBvMwqB-Bi2GQTo2PvAYdHuGgeMzn',
    'ITTIPAT_IEMDEE':              '1ta8Vztff3dm67gNYNCI-eMTz9yIR0Mr2',
    'JIRASSAYA_CHUENYOO':          '1Gst2r2MsQEaxVxDv0UF9AmWlx5fy45E4',
    'JIRAWAT__MAKARAPIROM':        '1rABkKpLPuOq0qF1SrnvHj06YSw7OiNvi',
    'KANISTHA_CHINRASRI':          '1_XCQ0F-BKKy3YE_bsBohaBCJX7abUBY4',
    'KHWANKHAE__SUBDA':            '1Z8fVCzQD7DegM8kHiI3_7f0MaXd84yA0',
    'KITSANA_BUAPHEAT':            '1V824Ukf3c_AKQc2O2uex-kXcQ83g7HaU',
    'NARUECHA_CHAIYAPHAN':         '1UlpOgH6NPOQjtvWn7zbtUyvq8qFd3jET',
    'PANALEE__UEASUNTHONNOP':      '11ngfUFBfnOnZHUw8kQDKdPaW9VDRicwR',
    'PASSAWAN_TOANUN':             '1x2xCkSgVAIjA63-YCljkTxJkH98DoYOC',
    'PATCHARAPORN_JORNSAMER':      '1sbAtRWy92as3IlWlFZo0tGnLjYXXfCSI',
    'PHANUPORN_PENGPUN':           '1-L15IIWrZFCN7Cc_ISY0BTFIKUgcoLe0',
    'PHIMRAPEEPORN_PHRASOPOL':     '1-kEqoXdewNrwFlnXJUl3sC0yWIJWYdUE',
    'PORNPHOP__LUANGPON':          '1zc5I9JGF7Zk5Adqbnt761qCruxuU8lox',
    'PUKARIN__TONGKLIANG':         '1ttwEKE0SC14ct_XxCvds4OeqnGlTuTCJ',
    'RAPIPHAN_KHAMSUWAN':          '1sEa57awsopMW60MIP52IghCYpJmTwB9N',
    'RATCHATA_PIRIYAKITSAKUL':     '1GHbFS2w58-axrpv6XOWo2svAH94lIXfk',
    'RATTIKARN_REANTONGWATTANA':   '1w8rt4qvKej2TfKjEklLjE4r1kDz24qma',
    'SARAN_THAMMATHORN':           '1n_-JL7U7i4Nhl1toxS33BvISTGjDdKlI',
    'SARAWUT_MANCHETHUAN':         '1MIMNKS1vje32zSGLHnAVG2bzJSR7izi4',
    'SASIMAPORN_KHANTHAHOME':      '1Jro8yR3S69d-nTqeWdFkCdSPC2PeR3c5',
    'SERMKEAT_HADJANG':            '1V4rUSdp9YKHLEP2Kw038aaLH11KxojR-',
    'SOM_KONKAEW':                 '1vjlzOmWnssN0vDFVTlMm8PATV3ImEsEu',
    'TEERAWAT__SUKKIT':            '12V8eOA7SO8hOHSU3Ox0GbBdn6hPC1IQK',
    'WUTTICHAI_CHINNAWONG':        '1K72zRMBdzNhuuALEQngBM8rQ8UqbQEZD',
  };

  /** normalize ชื่อ: แทนที่ space ด้วย _ แล้ว uppercase */
  function _normalize(name) {
    return name.trim().replace(/ /g, '_').toUpperCase();
  }

  /**
   * รับ Google Drive URL ของลายเซ็น
   * @param {string} name - ชื่อพนักงาน เช่น 'ANUPHAB CHANTO' หรือ 'ANUPHAB_CHANTO'
   * @returns {string|null}
   */
  function getUrl(name) {
    const key = _normalize(name);
    const id = SIGNATURE_IDS[key];
    if (!id) {
      console.warn(`[SignatureLoader] ไม่พบลายเซ็นของ: "${name}" (key: "${key}")`);
      return null;
    }
    return DRIVE_BASE_PREFIX + id + DRIVE_BASE_SUFFIX;
  }

  /**
   * fetch ลายเซ็นแล้วคืน ArrayBuffer (ใช้กับ PDF-lib ได้ตรงๆ)
   * คืน null ถ้าหาไม่เจอหรือโหลดไม่สำเร็จ
   * @param {string} name
   * @returns {Promise<ArrayBuffer|null>}
   */
  async function fetchArrayBuffer(name) {
    const url = getUrl(name);
    if (!url) return null;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[SignatureLoader] โหลดไม่สำเร็จ (${res.status}):`, url);
        return null;
      }
      return await res.arrayBuffer();
    } catch (err) {
      console.warn(`[SignatureLoader] fetch error:`, err);
      return null;
    }
  }

  /**
   * Set src ของ <img> element
   * @param {HTMLImageElement} imgEl
   * @param {string} name
   */
  function setSignatureImg(imgEl, name) {
    const url = getUrl(name);
    if (url) {
      imgEl.src = url;
      imgEl.alt = `ลายเซ็น ${name}`;
    }
  }

  return { getUrl, fetchArrayBuffer, setSignatureImg };
})();
