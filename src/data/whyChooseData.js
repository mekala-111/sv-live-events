import stageImg from "@/src/assets/Event Coverage.png";
import clientsImg from "@/src/assets/Photography.png";
import cameraImg from "@/src/assets/Video Production.png";
import citiesImg from "@/src/assets/bg.png";

export const whyChooseData = {
  label: "Why Choose Us",
  heading: "Built for trust, scale,",
  headingLine2: "and memorable",
  headingHighlight: "delivery.",
  description:
    "Our edge is not just equipment. It is the ability to make technology, timing and storytelling work together while the event is actually happening.",
  backgroundImage: "@/src/assets/Portfolio.png",
  statistics: [
    {
      value: 1000,
      suffix: "+",
      label: "Projects",
      desc: "Successfully delivered large scale events.",
      icon: "Briefcase",
      image: stageImg,
      tone: "orange",
    },
    {
      value: 500,
      suffix: "+",
      label: "Happy Clients",
      desc: "Trusted by brands and organizations worldwide.",
      icon: "Users",
      image: clientsImg,
      tone: "purple",
    },
    {
      value: 10,
      suffix: "+",
      label: "Years Experience",
      desc: "A decade of excellence in event production.",
      icon: "Trophy",
      image: cameraImg,
      tone: "orange",
    },
    {
      value: 50,
      suffix: "+",
      label: "Cities Covered",
      desc: "Delivering unforgettable experiences across India.",
      icon: "MapPin",
      image: citiesImg,
      tone: "purple",
      mapDots: true,
    },
  ],
  categories: [
    { label: "All Events", icon: "LayoutGrid" },
    { label: "Political", icon: "Flag" },
    { label: "Retail", icon: "ShoppingBag" },
    { label: "Festivals", icon: "Sparkles" },
    { label: "Weddings", icon: "Heart" },
    { label: "Corporates", icon: "Building2" },
    { label: "Concerts", icon: "Mic2" },
  ],
  particles: [
    { left: "12%", bottom: "28%", delay: "0s", duration: "8s", color: "#fdb515" },
    { left: "22%", bottom: "42%", delay: "1.2s", duration: "9s", color: "#ff8a00" },
    { left: "34%", bottom: "34%", delay: "2.1s", duration: "7.5s", color: "#fdb515" },
    { left: "48%", bottom: "48%", delay: "0.6s", duration: "10s", color: "#c084fc" },
    { left: "62%", bottom: "36%", delay: "1.8s", duration: "8.5s", color: "#ff8a00" },
    { left: "74%", bottom: "52%", delay: "2.6s", duration: "9.5s", color: "#fdb515" },
    { left: "18%", bottom: "58%", delay: "0.9s", duration: "8.2s", color: "#60a5fa" },
    { left: "55%", bottom: "24%", delay: "1.5s", duration: "9.2s", color: "#ff8a00" },
  ],
};

export default whyChooseData;
