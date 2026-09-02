import "./contacto.css";
import "../src/shared/site.js";
import { mountShell } from "../src/shared/shell.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initMeetingBooking } from "../src/components/meeting-booking/meeting-booking.js";
import { initCustomFormControls } from "../src/components/form-controls.js";

initMeetingBooking();
initCustomFormControls();
mountShell("contacto");
gsap.registerPlugin(ScrollTrigger);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = gsap.utils.toArray("[data-contact-reveal]");
if (!reduceMotion) {
  gsap.fromTo(
    revealItems,
    { y: 42, autoAlpha: 0, filter: "blur(8px)" },
    {
      y: 0,
      autoAlpha: 1,
      filter: "blur(0px)",
      duration: 1.05,
      stagger: 0.12,
      ease: "power3.out",
      delay: 0.12,
    },
  );
  gsap.utils
    .toArray("[data-contact-panel]")
    .forEach((panel, index) =>
      gsap.fromTo(
        panel,
        { y: 70, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1.1,
          delay: index * 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: panel, start: "top 84%", once: true },
        },
      ),
    );
}
const route = document.querySelector(".contact-route"),
  routeLine = route?.querySelector(".contact-route__line i"),
  routePoints = route
    ? [...route.querySelectorAll(".contact-route__point")]
    : [];
if (route && !reduceMotion)
  gsap.to(routeLine, {
    height: "100%",
    ease: "none",
    scrollTrigger: {
      trigger: route,
      start: "top 75%",
      end: "bottom 55%",
      scrub: 0.6,
      onUpdate: (self) => {
        const active = Math.min(
          routePoints.length - 1,
          Math.floor(self.progress * routePoints.length),
        );
        routePoints.forEach((point, index) =>
          point.classList.toggle("is-active", index <= active),
        );
      },
    },
  });
const counter = document.querySelector("[data-counter]");
if (counter) {
  const value = { current: 0 };
  gsap.to(value, {
    current: Number(counter.dataset.counter),
    duration: 1.4,
    ease: "power2.out",
    scrollTrigger: { trigger: counter, start: "top 88%", once: true },
    onUpdate: () => (counter.textContent = Math.round(value.current)),
  });
}
const glow = document.querySelector("[data-contact-glow]");
if (glow && !reduceMotion)
  glow.addEventListener("pointermove", (event) => {
    const rect = glow.getBoundingClientRect();
    glow.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
    glow.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
  });
const form = document.querySelector(".contact-form"),
  success = document.querySelector("[data-contact-success]");
if (form) {
  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const required = [...form.querySelectorAll("[required]")];
      required.forEach((field) =>
        field
          .closest(".field")
          ?.classList.toggle(
            "is-invalid",
            !field.value.trim() || !field.checkValidity(),
          ),
      );
      const invalid = required.find(
        (field) => !field.value.trim() || !field.checkValidity(),
      );
      if (invalid) {
        invalid.focus();
        gsap.fromTo(
          invalid.closest(".field"),
          { x: -7 },
          { x: 0, duration: 0.38, ease: "elastic.out(1,.35)" },
        );
        return;
      }
      success?.setAttribute("aria-hidden", "false");
      success?.classList.add("is-visible");
      if (success && !reduceMotion)
        gsap.fromTo(
          success.children,
          { y: 20, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
          },
        );
    },
    true,
  );
  form.addEventListener("input", (event) =>
    event.target.closest(".field")?.classList.remove("is-invalid"),
  );
}
document
  .querySelector("[data-contact-reset]")
  ?.addEventListener("click", () => {
    form?.reset();
    success?.classList.remove("is-visible");
    success?.setAttribute("aria-hidden", "true");
    form?.querySelector("input")?.focus();
  });
