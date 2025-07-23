
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, X, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { chat, ChatInput } from "@/ai/flows/chat-flow";
import { usePathname } from 'next/navigation';

type Message = {
  role: "user" | "model";
  content: string;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Halo! Saya asisten BDA.Camp. Ada yang bisa saya bantu untuk petualangan Anda?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isDashboard = pathname.startsWith('/dashboard');

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
        const chatInput: ChatInput = {
            history: messages,
            message: input
        };
      const result = await chat(chatInput);
      const modelMessage: Message = { role: "model", content: result.response };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error calling chat flow:", error);
      const errorMessage: Message = {
        role: "model",
        content: "Maaf, sepertinya saya sedang mengalami gangguan. Silakan coba lagi nanti.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isDashboard) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-4 z-50"
          >
            <Card className="w-[320px] h-[450px] shadow-2xl flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Bot className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg font-headline">Asisten AI</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0 flex-grow overflow-hidden">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                  <div className="p-4 space-y-4">
                    {messages.map((msg, index) => (
                      <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <AvatarIcon><Bot className="h-5 w-5" /></AvatarIcon>}
                        <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                            msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                           <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.role === 'user' && <AvatarIcon><User className="h-5 w-5" /></AvatarIcon>}
                      </div>
                    ))}
                    {isLoading && (
                       <div className="flex gap-3 justify-start">
                         <AvatarIcon><Bot className="h-5 w-5" /></AvatarIcon>
                         <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                           <Loader2 className="h-5 w-5 animate-spin" />
                         </div>
                       </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tanya sesuatu..."
                    disabled={isLoading}
                    className="pr-12"
                  />
                  <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          size="icon"
          className="fixed bottom-6 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </Button>
      </motion.div>
    </>
  );
}

const AvatarIcon = ({ children }: { children: React.ReactNode }) => (
    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
        {children}
    </div>
);
