// Select static & shared page elements
const overlayWrapper = document.getElementById("js-overlay");
const overlayContent = document.getElementById("js-overlay-target");

function toggleImageView(index) {
  const image = document.getElementById(`js-gallery-image-${index}`);

  image.classList.add("gallery__image--active");

  const imageParentElement = image.parentElement;

  if (!document.startViewTransition) {
    moveImageToModal(image);
    return;
  }

  const transition = document.startViewTransition(() =>
    moveImageToModal(image)
  );

  overlayWrapper.onclick = async function () {
    if (!document.startViewTransition) {
      moveImageToGrid(imageParentElement);
      image.classList.remove("gallery__image--active");
      return;
    }

    const transition = document.startViewTransition(() =>
      moveImageToGrid(imageParentElement)
    );

    await transition.finished;
    image.classList.remove("gallery__image--active");
  };
}

// Helper functions for moving the image around and toggling the overlay

function moveImageToModal(image) {
  overlayWrapper.classList.add("overlay--active");

  overlayContent.append(image);
}

function moveImageToGrid(imageParentElement) {
  imageParentElement.append(overlayContent.querySelector("img"));

  overlayWrapper.classList.remove("overlay--active");
}
