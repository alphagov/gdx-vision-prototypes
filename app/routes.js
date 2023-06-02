const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const {Issuer} = require('openid-client')
const {createPrivateKey} = require("node:crypto")

const keyString = "private key goes here"

const privateKey = createPrivateKey({
    key: Buffer.from(keyString, "base64"),
    type: "pkcs8",
    format: "der"
})

Issuer.discover("https://oidc.integration.account.gov.uk/.well-known/openid-configuration").then(issuer => {
    const client = new issuer.Client({
            client_id: "client id goes here",
            redirect_uris: ["http://localhost:8000/oauth/callback"],
            response_type: "code",
            token_endpoint_auth_method: "private_key_jwt",
            token_endpoint_auth_signing_alg: "RS256",
            id_token_signed_response_alg: "ES256",

        },
        {keys: [privateKey.export({format: "jwk"})]}
    )



    let tokenSet

    router.get("/login", (req, res) => {
        console.log(tokenSet)
        if (tokenSet && !tokenSet.expired()) {
            res.redirect("/signin/userinfo")
        } else {
            const loginUrl = client.authorizationUrl({
                scope: "openid email",
                vtr: `["Cl.Cm"]`,
                ui_locales: "en-GB en",
                nonce: 1,
                state: req.session.data["remembered-number"]
            })
            res.redirect(loginUrl)
        }
    })

    router.get("/oauth/callback", async (req, res) => {
        tokenSet = await client.callback(
            "http://localhost:8000/oauth/callback",
            client.callbackParams(req),
            {
                state: req.query.state,
                nonce: "1"
            }
        )
        const userinfo = await client.userinfo(tokenSet.access_token)
        console.log(userinfo)
        req.session.data['userinfo'] = JSON.stringify(userinfo)
        req.session.data['email'] = userinfo.email
        req.session.data['state'] = req.query.state
        res.redirect("/signin/userinfo")
    })
// V1
    router.post('/tgo/v1/married-or-civil-partnership-redirect', function (req, res) {
        req.session.data['married-or-civil-partnership'] === "yes"
            ? res.redirect('/tgo/v1/05-your-contact-details')
            : res.redirect('/tgo/v1/04a-next-of-kin')
    })

    router.post('/tgo/v1/next-of-kin-redirect', function (req, res) {
        req.session.data['next-of-kin'] === "yes"
            ? res.redirect('/tgo/v1/05-your-contact-details')
            : res.redirect('/tgo/v1/04b-managing-estate')
    })

    router.post('/tgo/v1/managing-estate-redirect', function (req, res) {
        req.session.data['managing-estate'] === "yes"
            ? res.redirect('/tgo/v1/05-your-contact-details')
            : res.redirect('/tgo/v1/04c-do-you-have-permission')
    })

    router.post('/tgo/v1/do-you-have-permission-redirect', function (req, res) {
        req.session.data['do-you-have-permission'] === "yes"
            ? res.redirect('/tgo/v1/05-your-contact-details')
            : res.redirect('/tgo/v1/04d-no-permission-end')
    })

    router.post('/tgo/v1/other-addresses-redirect', function (req, res) {
        req.session.data['has-other-addresses'] === "yes"
            ? res.redirect('/tgo/v1/06a-what-is-other-address')
            : res.redirect('/tgo/v1/07-local-council')
    })

    router.post('/tgo/v1/blue-badge-redirect', function (req, res) {
        req.session.data['has-blue-badge'] === "yes"
            ? res.redirect('/tgo/v1/09a-what-to-do-about-blue-badge')
            : res.redirect('/tgo/v1/10-keeper-of-vehicle')
    })

    router.post('/tgo/v1/keeper-of-vehicle-redirect', function (req, res) {
        req.session.data['keeper-of-vehicle'] === "yes"
            ? res.redirect('/tgo/v1/10a-what-to-do-about-vehicles')
            : res.redirect('/tgo/v1/11-driving-license')
    })

    router.post('/tgo/v1/search-address-redirect', function (req, res) {
        switch (req.session.data['house-number-name']) {
            case "0":
                res.redirect('/tgo/v1/05c-no-address-found')
                break;
            case "1":
                res.redirect('/tgo/v1/05e-confirm-address')
                break;
            default:
                res.redirect('/tgo/v1/05b-select-address')
                break;
        }
    })

    router.post('/tgo/v1/further-address-search-redirect', function (req, res) {
        switch (req.session.data['further-address-house-number-name']) {
            case "0":
                res.redirect('/tgo/v1/06c-further-address-no-address-found')
                break;
            case "1":
                res.redirect('/tgo/v1/06e-confirm-further-address')
                break;
            default:
                res.redirect('/tgo/v1/06b-select-further-address')
                break;
        }
    })

// V2

    router.post('/tgo/v2/married-or-civil-partnership-redirect', function (req, res) {
        req.session.data['married-or-civil-partnership'] === "yes"
            ? res.redirect('/tgo/v2/05-your-contact-details')
            : res.redirect('/tgo/v2/04a-next-of-kin')
    })

    router.post('/tgo/v2/next-of-kin-redirect', function (req, res) {
        req.session.data['next-of-kin'] === "yes"
            ? res.redirect('/tgo/v2/05-your-contact-details')
            : res.redirect('/tgo/v2/04b-managing-estate')
    })

    router.post('/tgo/v2/managing-estate-redirect', function (req, res) {
        req.session.data['managing-estate'] === "yes"
            ? res.redirect('/tgo/v2/05-your-contact-details')
            : res.redirect('/tgo/v2/04c-do-you-have-permission')
    })

    router.post('/tgo/v2/do-you-have-permission-redirect', function (req, res) {
        req.session.data['do-you-have-permission'] === "yes"
            ? res.redirect('/tgo/v2/05-your-contact-details')
            : res.redirect('/tgo/v2/04d-no-permission-end')
    })

    router.post('/tgo/v2/other-addresses-redirect', function (req, res) {
        req.session.data['has-other-addresses'] === "yes"
            ? res.redirect('/tgo/v2/06a-what-is-other-address')
            : res.redirect('/tgo/v2/07-local-council')
    })

    router.post('/tgo/v2/07a-council-services', (req, res) => {
        req.session.data['has-other-addresses'] === "yes"
            ? res.redirect('/tgo/v2/07b-local-council')
            : res.redirect('/tgo/v2/08-in-hospital')
    })

    const blueBadgePickerV2 = (req, res) => {
        req.session.data['has-other-addresses'] === "yes"
            ? res.redirect('/tgo/v2/09a-blue-badge-multi-council')
            : res.redirect('/tgo/v2/09-blue-badge')
    }

    router.post('/tgo/v2/08-in-hospital', (req, res) => {
        req.session.data['in-hospital'] === "yes"
            ? res.redirect('/tgo/v2/08b-which-hospital')
            : blueBadgePickerV2(req, res)
    })

    router.post('/tgo/v2/08b-which-hospital', blueBadgePickerV2)

    router.post('/tgo/v2/09-blue-badge', (req, res) => {
        req.session.data['blue-badge'].includes("yes")
            ? res.redirect("/tgo/v2/09b-what-to-do-about-blue-badge")
            : res.redirect("/tgo/v2/10-keeper-of-vehicle")
    })

    router.post('/tgo/v2/10-keeper-of-vehicle', (req, res) => {
        req.session.data['keeper-of-vehicle'] === "yes"
            ? res.redirect('/tgo/v2/10a-what-to-do-about-vehicles')
            : res.redirect('/tgo/v2/11-driving-license')
    })

    router.post('/tgo/v2/search-address-redirect', function (req, res) {
        switch (req.session.data['house-number-name']) {
            case "0":
                res.redirect('/tgo/v2/05c-no-address-found')
                break;
            case "1":
                res.redirect('/tgo/v2/05e-confirm-address')
                break;
            default:
                res.redirect('/tgo/v2/05b-select-address')
                break;
        }
    })

    router.post('/tgo/v2/further-address-search-redirect', function (req, res) {
        switch (req.session.data['further-address-house-number-name']) {
            case "0":
                res.redirect('/tgo/v2/06c-further-address-no-address-found')
                break;
            case "1":
                res.redirect('/tgo/v2/06e-confirm-further-address')
                break;
            default:
                res.redirect('/tgo/v2/06b-select-further-address')
                break;
        }
    })

// V3

    router.post('/tgo/v3/married-or-civil-partnership-redirect', function (req, res) {
        req.session.data['married-or-civil-partnership'] === "yes"
            ? res.redirect('/tgo/v3/06-your-contact-details')
            : res.redirect('/tgo/v3/05a-next-of-kin')
    })

    router.post('/tgo/v3/next-of-kin-redirect', function (req, res) {
        req.session.data['next-of-kin'] === "yes"
            ? res.redirect('/tgo/v3/06-your-contact-details')
            : res.redirect('/tgo/v3/05b-managing-estate')
    })

    router.post('/tgo/v3/managing-estate-redirect', function (req, res) {
        req.session.data['managing-estate'] === "yes"
            ? res.redirect('/tgo/v3/06-your-contact-details')
            : res.redirect('/tgo/v3/05c-do-you-have-permission')
    })

    router.post('/tgo/v3/do-you-have-permission-redirect', function (req, res) {
        req.session.data['do-you-have-permission'] === "yes"
            ? res.redirect('/tgo/v3/06-your-contact-details')
            : res.redirect('/tgo/v3/05d-no-permission-end')
    })

    router.post('/tgo/v3/other-addresses-redirect', function (req, res) {
        req.session.data['has-other-addresses'] === "yes"
            ? res.redirect('/tgo/v3/07a-what-is-other-address')
            : res.redirect('/tgo/v3/08-local-council')
    })

    router.post('/tgo/v3/08a-council-services', (req, res) => {
        req.session.data['has-other-addresses'] === "yes"
            ? res.redirect('/tgo/v3/08b-local-council')
            : res.redirect('/tgo/v3/09-in-hospital')
    })

    router.post('/tgo/v3/09-in-hospital', (req, res) => {
        req.session.data['in-hospital'] === "yes"
            ? res.redirect('/tgo/v3/09b-which-hospital')
            : blueBadgePickerV3(req, res)
    })

    const blueBadgePickerV3 = (req, res) => {
        req.session.data['has-other-addresses'] === "yes"
            ? res.redirect('/tgo/v3/10a-blue-badge-multi-council')
            : res.redirect('/tgo/v3/10-blue-badge')
    }

    router.post('/tgo/v3/09b-which-hospital', blueBadgePickerV3)

    router.post('/tgo/v3/10-blue-badge', (req, res) => {
        req.session.data['blue-badge'].includes("yes")
            ? res.redirect("/tgo/v3/10b-what-to-do-about-blue-badge")
            : res.redirect("/tgo/v3/11-keeper-of-vehicle")
    })

    router.post('/tgo/v3/11-keeper-of-vehicle', (req, res) => {
        req.session.data['keeper-of-vehicle'] === "yes"
            ? res.redirect('/tgo/v3/11a-what-to-do-about-vehicles')
            : res.redirect('/tgo/v3/12-driving-license')
    })

    router.post('/tgo/v3/search-address-redirect', function (req, res) {
        switch (req.session.data['house-number-name']) {
            case "0":
                res.redirect('/tgo/v3/06c-no-address-found')
                break;
            case "1":
                res.redirect('/tgo/v3/06e-confirm-address')
                break;
            default:
                res.redirect('/tgo/v3/06b-select-address')
                break;
        }
    })

    router.post('/tgo/v3/further-address-search-redirect', function (req, res) {
        switch (req.session.data['further-address-house-number-name']) {
            case "0":
                res.redirect('/tgo/v3/07c-further-address-no-address-found')
                break;
            case "1":
                res.redirect('/tgo/v3/07e-confirm-further-address')
                break;
            default:
                res.redirect('/tgo/v3/07b-select-further-address')
                break;
        }
    })

    router.post('/tgo/v3/one-login/create-choose-otp-method', function (req, res) {
        switch (req.session.data['security-code']) {
            case "otp-auth":
                res.redirect('/tgo/v3/one-login/signup/create-otp-auth')
                break;
            case "otp-sms":
            default:
                res.redirect('/tgo/v3/one-login/signup/create-otpsms')
                break;
        }
    })
})
