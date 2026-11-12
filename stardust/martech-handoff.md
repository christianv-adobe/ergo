# Martech hand-off

Everything below is scaffolded **off**. To ship it, set `enabled: true` on `consent.cmp` and on each route in `stardust/martech-contract.json`, then re-run `deploy/scripts/martech-scaffold.mjs` and `dynamics/scripts/dynamics-check.mjs` to confirm the enabled tags load. Enabled tags load on `www.ergo.de` only; preview with `?martech=on` (add `&consent=accept` to grant every category).

## Consent

- **CMP:** OneTrust · `data-domain-script` = `2e444b6c-b8f3-4168-9849-e299a3e2a79b`
- **Model `per-tag`:** the source loads the tag manager ungated and gates each tag inside it by consent group. Keep it: leave every route `category` null.
- **Categories** (default rule set): `E0020` Adobe Launch (always active) · `E0070` Adobe Target Basis (always active) · `E0090` ERGO Aktions-Webseite (always active) · `E0010` OneTrust (always active) · `E0030` Realperson Chat (always active) · `C0001` Unbedingt erforderliche Tools (always active) · `P0010` Adobe Analytics (inactive) · `P0020` Adobe Target Personalisierung & Messung (inactive) · `P0110` Alida Touchpoint-Survey Tool (inactive) · `P0050` Dynatrace (inactive) · `P0080` ERGO Online Survey Tool (inactive) · `P0100` Fullstory (inactive) · `C0003` Funktionelle Tools (inactive) · `P0090` MouseFlow (inactive) · `P0030` OneTrust Messung von Browser, Land, Device Type (inactive) · `C0002` Komfort- & Analyse-Tools (inactive) · `M0010` INACTIVE Adform (inactive) · `M0005` Affiliate (Finance Ads) (inactive) · `M0090` CND Motion Media GmbH (inactive) · `M0110` emarsys Web Extend-Technologie (inactive) · `M0120` ERGO Marketing Data Hub (inactive) · `M0140` Facebook Conversion Tracking (inactive) · `M0130` Facebook Retargeting (inactive) · `M0190` Facebook Custom Audience (inactive) · `M0060` Google Conversion Tracking inkl. Search Ads 360 (inactive) · `M0230` Google Custom Audience (inactive) · `M0040` Google Enhanced Conversion (inactive) · `M0050` Google Retargeting inkl. Search Ads 360 (inactive) · `M0260` LinkedIn Conversion-Tracking (inactive) · `M0030` Microsoft Conversion Tracking & Remarketing (Bing) (inactive) · `M0080` Microsoft Customer Match (inactive) · `M0160` Outbrain Retargeting und Conversion Tracking (UK) (inactive) · `M0250` Spoteffects (inactive) · `M0170` Taboola Retargeting und Abschluss Conversion Tracking (inactive) · `M0240` United Internet Media (inactive) · `M0270` Xing (inactive) · `C0004` Marketing-Tools (inactive) · `S0002` Google Maps (inactive) · `S0003` Vimeo (inactive) · `S0001` Youtube Videos (inactive) · `C0005` Sonstige Tools (inactive) · `E0050` Liferay (inactive) · `nx000` Erforderliche Dienste & Tools (inactive) · `nx100` Statistische Funktionen (inactive) · `nx200` Marketing Funktionen (inactive) · `nx300` nx External Media (inactive) · `E0060` Citrix (inactive) · `P0060` NEXOVI – virtueller Beratungsassistent (inactive) · `M0180` INACTIVE Yahoo Germany GmbH Lead-Conversion Tracking (inactive) · `M0150` INACTIVE Kooperation Otto FinanzPlus - Adition (inactive) · `M0210` INACTIVE 6h media (inactive) · `M0020` INACTIVE Adality (inactive) · `P0070` Knexus (inactive) · `M0100` INACTIVE Performance Media (inactive) · `M0220` INACTIVE PRIMEST GmbH Conversion Tracking (inactive) · `M0200` INACTIVE - Lead Link (inactive) · `E0080` Chatbase (inactive) · `M0070` INACTIVE - IntelliAd (inactive) · `P0040` UserZoom (inactive) · `E0040` Inbenta (inactive)

## Routes

| id | vendor | src | CMP groups listing its host | enabled |
|---|---|---|---|---|
| adobe-launch | Adobe Launch | `https://assets.adobedtm.com/launch-EN641c84e26bb144c49c90c0078d982c0b.min.js` | — | false |
| google-tag-manager | Google Tag Manager | `https://www.googletagmanager.com/gtag/js?id=AW-980528457` | — | false |

Also seen, not routed (loaded by the tag manager or inline on the source — confirm each still fires): marketing: ad / retargeting pixel · social proof: reviews widget.

## Rewrite before go-live

These read the old URLs or DOM and will not match the migrated pages:
- rule `RL12232ba857584acea3205adb8a2b019f` GE_03_FixforNotClosingConsentTool — selectors `#onetrust-accept-btn-handler`, `#onetrust-pc-sdk > div.ot-button-group-parent > div.ot-button-group > button.save-preference-btn-handler.onetrust-close-btn-handler`, `#accept-recommended-btn-handler`
- rule `RL1ef7d7b1689f460abd6ad7cff01129c7` MT_99_DKVBE_Google_AgencesSchmit — selectors `#block-gbltoolbox-gblviewmodenodehero > div > article > div > div.agent-adress > div > div > div > div.tab-content.fade.tabs-item.broker-address.in > div.info1 > span.PhoneNumber > span.value > a`, `#block-gbltoolbox-gblviewmodenodehero > div > article > div > div.agent-adress > div > div > div > div.tab-content.fade.tabs-item.broker-address.in > div.info1 > span.EmailAddress > a`, `#block-gbltoolbox-micrositeinfotop > div > div > div.brokercontact > div.tel > a`
- rule `RL4765914371f9493a8fdd7731852e1ab9` GE_03_AutoAllow4DigitalSignage — selectors `#onetrust-banner-sdk`
- rule `RL58da75759ffa4fc9b26929d4c6b95c3d` GE_03_redakteur_sitecore_fix — selectors `#onetrust-banner-sdk`
- rule `RL72be451ad31f4778add213f542ffce4e` GE_03_Author_Viewed_as_Published_AutoClose_50 — selectors `#onetrust-banner-sdk`
- rule `RL73d731a23eec41d0a164a1b6442561ed` AA_07_CloseModal_50 — selectors `button.ee_modal__close-button`
- rule `RL7a5b93a207d64e2699d9a21b3f963cd4` AA_10_Fahrraddiebstahl_GeneralClick_50 — selectors `#fahrraddiebstahl`
- rule `RL8a4d82fd5def44f6bccbe2c49b0261ae` AA_06_NewContactLeadForm_ClickSubmit_50 — selectors `button.ee_button:nth-child(2)`
- rule `RL8bda31024b35496bbc075c44566baaef` MT_03_google_Kontaktformulare_Angebot_ Feedback_50_WeAreReady — selectors `#c_page2 > div > div:nth-child(6) > a:nth-child(2)`
- rule `RL9bdb7d757cd146fbb67bb662c945fbdf` AA_03_RatingBlogArticle_Click_50 — selectors `div.rating-form > ul`
- rule `RLa38805b98cc44d31a16b148dfa2f2e70` MT_99_DKVBE_Google_Facebook_Microsoft_Nova-LP-Scroll — selectors `#block-novamockuprighten > div > div.field--name-field_intro.field--type-text_long.field__item > h2`, `#block-novamockupright > div > div.field--name-field_intro.field--type-text_long.field__item > h2`
- rule `RLb19102c980a240b1b063248c03dd0fc4` AA_03_ShareBlogArticle_Click_50 — selectors `div.share > ul`
- rule `RLb6a19e1f9e0444b099112133b18fcff1` MT_99_DKVBE_Google_Facebook_Microsoft_B2B-LP-Scroll — selectors `#block-gbltoolbox-content > div > article > div > div > div:nth-child(5) > div > div > div > div > div > h2`
- rule `RLbd51a9e93a7244abbdd5d8c38cf6374a` GE_03_OneTrust_RCM Aktionswebsites_dataSecurity+imprint — selectors `#onetrust-policy-text`, `#ot-pc-desc`
- rule `RLe16a4ee3fd4b4d7da7d6084354796e5b` GE_03_OneTrust_Hide_Banner — selectors `.onetrust-pc-dark-filter.ot-hide`
- rule `RLe2a9769b48204c60b11dd7a8b31f23ab` MT_99_DKVBE_Facebook_Communication-LPs-Scroll — selectors `.col-1.product_matrix_col_product.container-wrapper > div.read-more-wrapper.read-more-wrapper-footer > a`
- rule `RLed2a1f2e0cdc4426976a48f7dd3843fd` AA_03_ClickToTweetBlogArticle_Click_50 — selectors `a.ctt-btn`
- rule `RLf7c6fae82a5c4e8a8bb731ef0b33b320` MT_99_DKVBE_MicrosoftAds_AgencesSchmit — selectors `#block-gbltoolbox-gblviewmodenodehero > div > article > div > div.agent-adress > div > div > div > div.tab-content.fade.tabs-item.broker-address.in > div.info1 > span.PhoneNumber > span.value > a`, `#block-gbltoolbox-gblviewmodenodehero > div > article > div > div.agent-adress > div > div > div > div.tab-content.fade.tabs-item.broker-address.in > div.info1 > span.EmailAddress > a`, `#block-gbltoolbox-micrositeinfotop > div > div > div.brokercontact > div.tel > a`
- data element `Tarif_CSS` — selectors `div.DataElementVertriebsprodukt`
- data element `TarifModus_CSS` — selectors `div.DataElementTarifmodus`
- data element `GroupOfPages_CustomCode` — selectors `head > link`, `.carbon-search`
- data element `SalesValue_CSS` — selectors `div.DataElementBeitrag`
- data element `nonce` — selectors `script[nonce]`

## Data layer

The source pages expose `dataLayer`; keep the same global names.
Rules in Google Tag Manager were not parsed. Read each library listed in `martech/tags.json` and record its rules and data elements in the contract's `tagNotes`, keyed by tag manager, each citing where it was read (`from`); until then their triggers and events come from the tagging plan.
Ask the owner for the tagging plan (solution design reference): each event, its payload and the interaction that pushes it. With it, add each push in the block that owns the interaction.

## Web SDK (aem-martech)

The source runs the Adobe Experience Platform Web SDK from the Launch extension 2.34.1 (managed library, self-hosted build supported). The `aem-martech` plugin can load it on the migrated site instead. It is off; the routes above stay the default.

- **orgId:** `1D3511B55605198B7F000101@AdobeOrg` · **instance:** `alloy` · **edge domain:** **not found — fill it in the contract**
- **datastreamId:** `a91a67cc-9050-4e12-a01c-bb733b54c84f`
- **defaultConsent:** source `pending`; the plugin defaults to `pending` and sends nothing until `updateUserConsent`. With `aemMartech.category` set, the scaffold starts the SDK `pending` whatever this value and grants `collect` once the CMP grants that group; without a category, this value applies as is. Launch rules that call `setConsent` on the source are not read — set the category to keep a consent gate.
- **Missing Launch extension:** Adobe Client Data Layer — the plugin requires it.

To switch: (1) `git subtree add --squash --prefix plugins/martech https://github.com/adobe-rnd/aem-martech.git main`; (2) in Launch, set the Web SDK extension to the self-hosted build with the same instance name and publish — otherwise the SDK loads twice; (3) set `aemMartech.enabled` and leave the `adobe-launch` route disabled (the plugin loads `launchUrls`); (4) re-run the scaffold.
