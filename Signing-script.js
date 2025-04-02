// define your device here
const devices = {
    "iPad mini 6": "iPad14,1",
    "iPhone 13 Pro Max": "iPhone14,3",
    "iPad 6": "iPad7,5",
    "AppleTV 4": "AppleTV5,3",
    "iPhone X": "iPhone10,3"
};

const device = args.widgetParameter || "iPhone14,3";
const deviceName = Object.keys(devices).find(key => devices[key] === device) || "Unbekannt";

// API-URL
const url = `https://api.ipsw.me/v4/device/${encodeURIComponent(device)}?type=ipsw`;

const widget = new ListWidget();
const updates = await fetchUpdates();
await createWidget(updates);

if (!config.runsInWidget) {
    await widget.presentSmall();
}
Script.setWidget(widget);
Script.complete();

async function createWidget(updates) {
    widget.setPadding(20, 15, 10, 15);

    const title = widget.addText(`${deviceName}`);
    title.font = Font.mediumSystemFont(13);
    title.textColor = Color.dynamic(new Color("#000"), new Color("#fff"));
    widget.addSpacer(10);

    updates.forEach((update) => {
        const row = widget.addStack();
        row.layoutHorizontally();

        const versionText = row.addText(`${update.version} (${update.build})`);
        versionText.font = Font.systemFont(14);
        versionText.textColor = update.signed ? new Color("#00CD66") : new Color("#E50000");

        row.addSpacer();

        const statusSigned = row.addText(update.signed ? "✓" : "✗");
        statusSigned.font = Font.boldSystemFont(14);
        statusSigned.textColor = update.signed ? new Color("#00CD66") : new Color("#E50000");

        widget.addSpacer(4);
    });
}

async function fetchUpdates() {
    const req = new Request(url);
    const apiResult = await req.loadJSON();

    if (!apiResult || !apiResult.firmwares) {
        return [];
    }

    const updates = apiResult.firmwares.map((firmware) => ({
        version: firmware.version.replace(/^9\.9\./, ""),
        build: firmware.buildid,
        signed: firmware.signed,
    }));

    
    const signedUpdates = updates.filter((u) => u.signed);
    const unsignedUpdates = updates.filter((u) => !u.signed);

    return [...signedUpdates, ...unsignedUpdates].slice(0, 5);
}
