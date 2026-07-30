import consultImg from "@/src/assets/Photography.png";
import planImg from "@/src/assets/drone.png";
import produceImg from "@/src/assets/Event Coverage.png";
import editImg from "@/src/assets/liveStreaming.png";
import deliverImg from "@/src/assets/Logo.png";

export const processData = {
  label: "Our Process",
  heading: "A clear production journey from first call to",
  headingHighlight: "final delivery.",
  description:
    "A streamlined five-step workflow that keeps every production sharp, on time, and cinematic — from the first conversation to final handoff.",
  backgroundImage: "@/src/assets/Portfolio.png",
  steps: [
    {
      step: "01",
      title: "Consultation",
      desc: "We understand your vision, goals and event requirements in detail.",
      icon: "MessageCircle",
      image: consultImg,
      items: ["Requirements Gathering", "Idea Discussion", "Budget & Feasibility"],
    },
    {
      step: "02",
      title: "Planning",
      desc: "A precise production roadmap covering crew, tech and timelines.",
      icon: "ClipboardList",
      image: planImg,
      items: ["Event Strategy", "Technical Planning", "Resource Allocation"],
    },
    {
      step: "03",
      title: "Production",
      desc: "On-ground execution with cinematic capture and live control.",
      icon: "Camera",
      image: produceImg,
      items: ["Setup & Rehearsal", "Live Execution", "On-site Management"],
    },
    {
      step: "04",
      title: "Editing",
      desc: "Premium post-production that elevates every captured moment.",
      icon: "Scissors",
      image: editImg,
      items: ["Video Editing", "Color Grading", "Audio Enhancement"],
    },
    {
      step: "05",
      title: "Delivery",
      desc: "Polished final assets delivered with care and lasting support.",
      icon: "Package",
      image: deliverImg,
      items: ["Final Output Delivery", "Client Review", "Post Event Support"],
    },
  ],
  cta: {
    badge: "Excellence at every step",
    text: "From concept to completion, we ensure your event is executed flawlessly and remembered forever.",
    buttonLabel: "Let's Work Together",
    buttonHref: "#book-now",
  },
  particles: [
    { left: "14%", bottom: "30%", delay: "0s", duration: "8s", color: "#fdb515" },
    { left: "28%", bottom: "44%", delay: "1.1s", duration: "9s", color: "#ff8a00" },
    { left: "46%", bottom: "36%", delay: "2s", duration: "7.5s", color: "#fdb515" },
    { left: "62%", bottom: "50%", delay: "0.7s", duration: "10s", color: "#c084fc" },
    { left: "78%", bottom: "40%", delay: "1.6s", duration: "8.5s", color: "#ff8a00" },
    { left: "38%", bottom: "58%", delay: "2.4s", duration: "9.5s", color: "#60a5fa" },
  ],
};

export default processData;
