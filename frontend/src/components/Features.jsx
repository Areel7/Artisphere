import React from "react";
import { Maximize, Layers, ShoppingCart } from "lucide-react";

const Features = () => {
  return (
    <>
      {/* Value Proposition / Features */}
      <section className="py-8 border-y border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-[90rem] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Maximize,
              title: "Interactive 3D Walkthroughs",
              desc: "Experience spatial art in your browser or AR.",
            },
            {
              icon: Layers,
              title: "Multimedia Storytelling",
              desc: "Dive deeper into the context of every masterpiece.",
            },
            {
              icon: ShoppingCart,
              title: "Seamless Ecommerce",
              desc: "Secure purchases directly from artists and curators.",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-3 opacity-70 hover:opacity-100 transition-opacity p-6 rounded-2xl hover:bg-white/5"
            >
              <feature.icon className="w-6 h-6 text-white" />
              <h4 className="font-semibold text-lg">{feature.title}</h4>
              <p className="text-sm text-white/60 font-light">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Features;
