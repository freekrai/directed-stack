import { JSONTree } from "react-json-tree";

// themes: https://github.com/reduxjs/redux-devtools/tree/75322b15ee7ba03fddf10ac3399881e302848874/src/react/themes
const jsonTreeTheme = {
    scheme: "harmonic16",
    author: "jannik siebert (https://github.com/janniks)",
    base00: "#0b1c2c",
    base01: "#223b54",
    base02: "#405c79",
    base03: "#627e99",
    base04: "#aabcce",
    base05: "#cbd6e2",
    base06: "#e5ebf1",
    base07: "#f7f9fb",
    base08: "#bf8b56",
    base09: "#bfbf56",
    base0A: "#8bbf56",
    base0B: "#56bf8b",
    base0C: "#568bbf",
    base0D: "#8b56bf",
    base0E: "#bf568b",
    base0F: "#bf5656",
};

export default function TreeViewer({ json }: { json: any }) {
    return (
        <div>
            <JSONTree invertTheme={false} data={json} theme={jsonTreeTheme} />
        </div>
    )
}