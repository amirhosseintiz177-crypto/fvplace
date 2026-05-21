# FVPlace Vanilla

Static vanilla rewrite of FVPlace Nova using only HTML, CSS, and JavaScript.

## Included routes

- `/` home
- `/tour/`, `/solutions/`, `/security/`, `/pricing/`
- `/login/`, `/register/`
- `/dashboard/`, `/files/`, `/workspaces/`, `/team/`, `/activity/`, `/settings/`
- `/share/demo/`
- `/profile/nova/`

## Notes

- The UI works in demo mode without the API and stores local demo changes in `localStorage`.
- Default app URL follows the current site origin, for example `https://fvplace.runflare.run` or `http://127.0.0.1:3000`.
- Default API URL also follows the current site origin so the vanilla server works without a separate `:4000` backend.
- You can change both from the settings page and export/import the runtime config as JSON.
- Auth, dashboard, workspace, file, profile, and share calls switch to the configured API automatically.
