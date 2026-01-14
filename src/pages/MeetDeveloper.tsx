import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Sparkles,
  Copy,
  ExternalLink,
  Zap,
  Gift,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function MeetDeveloper() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen md:h-screen bg-background flex flex-col overflow-x-hidden md:overflow-hidden">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:py-4 lg:py-6 flex items-center justify-center z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full h-full md:h-auto md:max-h-[85vh] lg:max-h-[80vh] relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] rounded-[2.5rem] overflow-hidden bg-card"
        >
          {/* Decorative Background Elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="w-full h-full flex flex-col lg:grid lg:grid-cols-10 lg:max-h-[700px] group relative z-10">
            {/* Left Wing: Visual & Identity */}
            <div className="relative h-64 sm:h-72 md:h-80 lg:h-auto lg:col-span-4 shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
              <img
                src="/developer.jpg"
                alt="Jakir Hossen"
                className="w-full h-full object-cover transform lg:group-hover:scale-105 transition-transform duration-[2s] ease-out"
              />

              <div className="absolute bottom-6 left-6 lg:bottom-10 lg:left-10 z-20 space-y-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter drop-shadow-2xl">
                    Jakir Hossen
                  </h3>
                  <div className="flex items-center gap-2.5 mt-1">
                    <div className="h-2 w-2 lg:h-2.5 lg:w-2.5 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.5)] animate-pulse" />
                    <span className="text-[10px] lg:text-xs font-black text-white/90 uppercase tracking-[0.2em] drop-shadow-md">
                      Creator & Developer
                    </span>
                  </div>
                </motion.div>
              </div>

              <div className="absolute top-6 left-6 z-20">
                <Badge className="bg-primary/40 backdrop-blur-xl border-white/20 text-white font-black px-3 py-1 rounded-full text-[9px] uppercase tracking-[0.15em] shadow-lg">
                  FOUNDER
                </Badge>
              </div>
            </div>

            {/* Right Wing: Content & Engagement */}
            <div className="flex-1 p-6 md:p-8 lg:p-10 lg:col-span-6 flex flex-col overflow-y-auto custom-scrollbar bg-card">
              <div className="space-y-8 lg:space-y-10">
                <div className="space-y-4 lg:space-y-5">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 shadow-inner">
                      <Sparkles className="h-5 w-5 lg:h-6 lg:w-6 text-primary fill-primary/20" />
                    </div>
                    <h4 className="text-xl lg:text-2xl font-black tracking-tight text-foreground">
                      Built with ❤️ for you!
                    </h4>
                  </div>
                  <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed font-medium">
                    I'm Jakir, and I believe tools for growth should be as
                    beautiful as they are functional.{" "}
                    <br className="hidden lg:block" />
                    This app is my passion project, built to empower learners
                    worldwide.
                  </p>
                  <p className="text-[12px] lg:text-sm text-muted-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-4">
                    If our paths have crossed through this app and it has helped
                    you, your support keeps the fires burning and the servers
                    running. ❤️
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                  {/* bKash Support Card */}
                  <Card className="bg-muted/30 border border-primary/5 rounded-[1.5rem] lg:rounded-[2rem] p-5 lg:p-6 shadow-sm hover:shadow-xl transition-all duration-300 group/bkash relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover/bkash:opacity-10 transition-opacity">
                      <Gift className="h-20 w-20 lg:h-24 lg:w-24 text-primary" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-5 lg:gap-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                          bKash Personal
                        </span>
                        <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
                      </div>
                      <div className="space-y-3 lg:space-y-4">
                        <div className="flex items-center gap-2 bg-background p-2.5 rounded-xl lg:rounded-2xl ring-1 ring-inset ring-primary/10">
                          <span className="font-mono text-lg lg:text-xl font-black tracking-tighter flex-1 pl-1 truncate">
                            01839440328
                          </span>
                          <Button
                            variant="primary"
                            size="icon"
                            className="h-9 w-9 lg:h-10 lg:w-10 rounded-lg shadow-lg active:scale-90 transition-transform shrink-0"
                            onClick={() => {
                              navigator.clipboard.writeText("01839440328");
                              toast.success("bKash number copied! ❤️");
                            }}
                          >
                            <Copy className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                          </Button>
                        </div>
                        <p className="text-[9px] text-center font-bold text-muted-foreground/60 uppercase tracking-[0.1em]">
                          Tap button to copy
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* QR Code Container */}
                  <Card className="bg-accent/5 border border-accent/10 rounded-[1.5rem] lg:rounded-[2rem] p-4 lg:p-5 flex flex-col items-center justify-center gap-2 lg:gap-3 group/qr hover:bg-accent/10 hover:shadow-xl transition-all duration-300">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-accent/20 rounded-2xl blur-xl opacity-0 group-hover/qr:opacity-100 transition-opacity" />
                      <img
                        src="/donate.jpeg"
                        alt="Donate QR"
                        className="w-20 h-20 lg:w-24 lg:w-24 object-cover rounded-xl shadow-2xl border-2 border-white relative cursor-pointer"
                        onClick={() => window.open("/donate.jpeg", "_blank")}
                      />
                    </div>
                    <p className="text-[9px] lg:text-[10px] font-black text-accent/70 uppercase tracking-[0.15em]">
                      Scan to support
                    </p>
                  </Card>
                </div>

                <div className="space-y-4 lg:space-y-6 pt-2">
                  <Button
                    variant="outline"
                    className="w-full h-12 lg:h-14 rounded-xl lg:rounded-2xl border-primary/20 hover:bg-primary/5 font-black text-sm lg:text-base group/site shadow-sm transition-all"
                    asChild
                  >
                    <a
                      href="https://jakirhossen.netlify.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-3 h-4 w-4 lg:h-5 lg:w-5 text-primary group-hover/site:translate-x-1 transition-transform" />
                      Official Portfolio
                    </a>
                  </Button>

                  <div className="bg-primary/5 rounded-[1.25rem] lg:rounded-2xl p-4 lg:p-6 text-center border border-primary/10 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <p className="text-[11px] lg:text-sm text-muted-foreground font-semibold leading-relaxed">
                      "Your kindness empowers me to keep building. Together, we
                      make learning accessible for all. Thank you! ❤️"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
