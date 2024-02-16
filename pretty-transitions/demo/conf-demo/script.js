import {
    getPageContent,
    onLinkNavigate,
    transitionHelper,
    getLink,
} from "./utils.js";

onLinkNavigate(async ({ fromPath, toPath }) => {
    const content = await getPageContent(toPath);
    let targetThumbnail;

    if (!toPath.endsWith("index.html")) {
        targetThumbnail = getLink(toPath).closest(".card").querySelector("img");
        targetThumbnail.style.viewTransitionName = "avatar-img";
    }

    transitionHelper({
        updateDOM() {
            document.body.innerHTML = content;
        },
    });
});
