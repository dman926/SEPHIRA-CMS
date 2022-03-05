## THIS PROJECT IS BEGIN ARCHIVED FOR FUTURE REFERENCE.
## THIS PROJECT IS ABANDONED.
## DO NOT USE THIS PROJECT IN IT'S CURRENT STATE.
## I WILL NOT BE PROVIDING SUPPORT FOR IT.

# SEPHIRA

![SEPHIRA Logo](./SEPHIRA_logo.svg?raw=true)

## Self Executing, Processing, and Handling of Information from Real-world Applications

An Angular 13 front end with a complete FastAPI API, complete with server-side rendering, bCrypt password authentication, two-factor time-based one time passwords, JWT tokens, database CRUD, file uploading and retrieving, cookies, async emailing on-demand and async style tasks, websockets, ReCAPTCHA V3 support, and in-browser page and main menu creation and editing, as well as a full ecommerce template with Stripe Payment Intent API and webhook integration, Paypal Smart Buttons, Coinbase Commerce API and webhook integration, and NOWPayments integrations, complete with US zip tax handling and custom shipping zones

## How to get the project running

TODO

## Releases

| Release | Name | Release State | Description |
|:--------|:-----|:--------------|:------------|
| [V1.0.0](https://github.com/dman926/SEPHIRA/releases/tag/v1.0.0) | None | Full release | The first full release of SEPHIRA. Technically works, but is written in an outdated style and was very complex. Should not be used. |
| [V1.1.0](https://github.com/dman926/SEPHIRA/releases/tag/v1.1.0) | None | Beta | An improvement on V1.0.0. Features a post-type overhaul. Never fully released. Has the same issue as V1.0.0 and should not be used. |
| [V2.0.0](https://github.com/dman926/SEPHIRA/releases/tag/v2.0.0-alpha.2) | Ars | Alpha | A complete rework of Angular and a switch from Flask to FastAPI. Features many more options that don't require complex code, such as many more environment variables for Angular, and a config file for FastAPI. Features a rework of the media browser and file storage, utilizing a folder structure and GridFS to store media files that are optionally broken down into its components (video only. ex. video, audio, and subtitles are separated). Includes a video player powered by Video.js with multiple video/audio/subtitle track support to play saved media (has bugs currently). Features eCommerce supported by Stripe, PayPal, Coinbase Commerce, and NOWPayments (requires testing). Features a new theme system with light and dark mode switching and a default "Ars" theme. Could be used for simple sites lacking shop support. but not recommended for production until full release. |

## External dependencies

MongoDB, ffmpeg (optional)
