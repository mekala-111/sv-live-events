"use client";

import Image from "next/image";
import {
  ChevronRight,
  Instagram,
  Link2,
  Linkedin,
  Mail,
  MapPin,
  Monitor,
  Phone,
  ShieldCheck,
  Video,
  Youtube,
} from "lucide-react";
import logo from "@/src/assets/logo-sm.png";
import portfolioBg from "@/src/assets/Portfolio.png";
import { useSite } from "@/src/hooks/useSite";
import { resolveHref } from "@/src/lib/resolveHref";
import "./footer.css";

function FacebookIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H7.9v-2.9h2.4V9.41c0-2.37 1.41-3.68 3.57-3.68 1.03 0 2.12.18 2.12.18v2.33h-1.2c-1.18 0-1.55.73-1.55 1.48v1.78h2.64l-.42 2.9h-2.22V22c4.78-.75 8.44-4.91 8.44-9.93z" />
    </svg>
  );
}

const contactIcons = { Phone, Mail, MapPin };
const socialIcons = {
  Instagram,
  Facebook: FacebookIcon,
  Youtube,
  Linkedin,
};

function FooterLink({ href, label }) {
  const isLogin = href === "#login";

  return (
    <a
      href={resolveHref(href)}
      onClick={(e) => {
        if (!isLogin) return;
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("sv:open-login"));
      }}
      className="footer-link group flex items-center gap-2 text-[14px] text-white/68 transition hover:text-white"
    >
      <ChevronRight className="footer-chevron h-3.5 w-3.5 shrink-0 text-[#fdb515] transition-transform duration-300" />
      <span>{label}</span>
    </a>
  );
}

function ColumnHead({ icon: Icon, title }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <Icon className="h-4 w-4 text-[#fdb515]" strokeWidth={2} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white">
        {title}
      </p>
    </div>
  );
}

export function FooterSection() {
  const { site, footer } = useSite();
  const year = new Date().getFullYear();

  const contactItems = footer.contactItems ?? [];
  const quickLinks = footer.quickLinks ?? [];
  const services = footer.services ?? [];
  const platformLinks = footer.platformLinks ?? [];
  const social = footer.social ?? [];
  const trust = footer.trust ?? {};

  return (
    <footer className="relative isolate overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src={portfolioBg}
          alt=""
          fill
          priority={false}
          placeholder="blur"
          className="object-cover object-[85%_center] opacity-45"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #050505 0%, #050505 42%, rgba(5,5,5,0.82) 68%, rgba(5,5,5,0.55) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505]/75" />
        <div className="footer-noise absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 pt-14 md:px-8 md:pt-16 lg:pt-20">
        {/* Main columns */}
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.85fr_0.85fr_0.95fr] lg:gap-8 xl:gap-10">
          {/* Brand + contact */}
          <div className="lg:border-r lg:border-white/10 lg:pr-8">
            <div className="inline-flex items-center gap-3.5">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border border-[#fdb515]/40 bg-black/70 p-1 shadow-[0_0_28px_rgba(253,181,21,0.25)]">
                <Image
                  src={logo}
                  alt={`${site.companyName} logo`}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div>
                <p className="font-heading text-base font-bold tracking-[0.18em] text-white">
                  {site.companyNameHtml.prefix}
                  <span className="text-[#fdb515]">{site.companyNameHtml.highlight}</span>
                  {site.companyNameHtml.suffix}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-white/45">
                  {site.tagline}
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/62">{footer.blurb}</p>

            <div className="mt-7 space-y-4">
              {contactItems.map((item) => {
                const Icon = contactIcons[item.icon] ?? Phone;
                const Wrapper = item.href ? "a" : "div";
                const props = item.href ? { href: resolveHref(item.href) } : {};

                return (
                  <Wrapper
                    key={item.id}
                    {...props}
                    className="flex items-start gap-3.5 transition hover:opacity-95"
                  >
                    <div className="footer-icon-box flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#fdb515]/45 bg-[#ff8a00]/10 text-[#fdb515]">
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{item.value}</p>
                      <p className="mt-0.5 text-[12px] text-white/50">{item.detail}</p>
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <ColumnHead icon={Link2} title="Quick Links" />
            <div className="space-y-3">
              {quickLinks.map((item) => (
                <FooterLink key={item.label} href={item.href} label={item.label} />
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <ColumnHead icon={Video} title="Services" />
            <div className="space-y-3">
              {services.map((item) => {
                const label = typeof item === "string" ? item : item.label;
                const href = typeof item === "string" ? "#services" : item.href;
                return <FooterLink key={label} href={href} label={label} />;
              })}
            </div>
          </div>

          {/* Platform */}
          <div>
            <ColumnHead icon={Monitor} title="Platform" />
            <div className="space-y-3">
              {platformLinks.map((item) => (
                <FooterLink key={item.label} href={item.href} label={item.label} />
              ))}
              <a
                href={site.phoneHref}
                className="footer-link mt-2 inline-flex items-center gap-2.5 text-sm font-semibold text-white transition hover:text-[#fdb515]"
              >
                <Phone className="h-4 w-4 text-[#fdb515]" strokeWidth={2} />
                {site.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Trust + social */}
        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 py-8 md:mt-14 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3.5 sm:items-center">
            <div className="footer-icon-box flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#fdb515]/45 bg-[#ff8a00]/12 text-[#fdb515]">
              <ShieldCheck className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white sm:text-base">
                {trust.title}{" "}
                <span className="text-[#fdb515]">{trust.highlight}</span>
              </p>
              <p className="mt-1 text-sm text-white/50">{trust.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {social.map((item) => {
              const Icon = socialIcons[item.icon] ?? Instagram;
              const external = String(item.href ?? "").startsWith("http");
              return (
                <a
                  key={item.label}
                  href={resolveHref(item.href)}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  aria-label={item.label}
                  className="footer-social flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition duration-300"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </a>
              );
            })}
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {year}{" "}
            <span className="font-medium text-[#fdb515]">
              {footer.copyrightBrand ?? "SV Live Events"}
            </span>
            {footer.copyrightSuffix ?? ". All rights reserved."}
          </p>
          <p>
            {footer.tagline ?? "Built for"}{" "}
            <span className="font-medium text-[#fdb515]">
              {footer.taglineHighlight ?? "premium"}
            </span>{" "}
            {footer.taglineSuffix ?? "event production."}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
