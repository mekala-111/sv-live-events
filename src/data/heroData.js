export const heroData = {
  eyebrow: "Trusted Event Production Company",
  starCount: 5,
  headline: ["CAPTURING", "MOMENTS.", "CREATING", "EXPERIENCES."],
  goldWordIndexes: [2, 3],
  description:
    "SV Live Events delivers premium Photography, Videography, Live Streaming, Drone Cinematography, LED Wall Solutions, Visual Jockey, and complete Event Production for Weddings, Corporate Events, Political Meetings, Concerts, and Exhibitions.",
  buttons: [
    {
      id: "book",
      label: "Book Your Event",
      href: "platform:/booking",
      variant: "primary",
      icon: "ArrowRight",
    },
    {
      id: "showreel",
      label: "Watch Showreel",
      href: "#portfolio",
      variant: "secondary",
      icon: "Play",
    },
  ],
  chips: [
    { label: "Photography", icon: "Camera" },
    { label: "Videography", icon: "Clapperboard" },
    { label: "Drone", icon: "Globe" },
    { label: "Live Streaming", icon: "Radio" },
    { label: "LED Screens", icon: "MonitorPlay" },
    { label: "Visual Jockey", icon: "Mic2" },
  ],
  floatingCards: [
    { icon: "Camera", title: "Photography", subtitle: "Premium Coverage" },
    { icon: "Radio", title: "Live Streaming", subtitle: "Multi Camera" },
    { icon: "Globe", title: "Drone", subtitle: "4K Aerial Coverage" },
    { icon: "MonitorPlay", title: "LED Screens", subtitle: "Indoor & Outdoor" },
    { icon: "SlidersHorizontal", title: "Visual Jockey", subtitle: "Live Visual Production" },
  ],
  counters: [
    { value: 1500, suffix: "+", label: "Events", icon: "Calendar" },
    { value: 500, suffix: "+", label: "Happy Clients", icon: "Smile" },
    { value: 10, suffix: "+", label: "Years", icon: "Award" },
    { value: 100, suffix: "%", label: "Success", icon: "TrendingUp" },
    { value: 24, suffix: "/7", label: "Support", icon: "Headphones" },
  ],
  backgroundImage: "/assets/bg.png",
  backgroundVideo: null,
};

export default heroData;
