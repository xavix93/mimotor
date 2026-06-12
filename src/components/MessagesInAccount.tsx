"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
};

type Conversation = {
  id: string;
  car_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  cars: Car | null;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function MessagesInAccount() {
  const searchParams = useSearchParams();

  const [userId, setUserId] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const loadConversations = async () => {
    try {
      setLoading(true);

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        alert(sessionError.message);
        return;
      }

      const user = sessionData.session?.user;

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          *,
          cars (
            id,
            brand,
            model,
            year,
            price
          )
        `
        )
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) {
        alert(error.message);
        return;
      }

      const conversationList = (data || []) as Conversation[];
      setConversations(conversationList);

      const conversationFromUrl = searchParams.get("conversation");

      if (conversationFromUrl) {
        const foundConversation = conversationList.find(
          (conversation) => conversation.id === conversationFromUrl
        );

        if (foundConversation) {
          setActiveConversation(foundConversation);
          await loadMessages(foundConversation.id);
          return;
        }
      }

      if (conversationList.length > 0) {
        setActiveConversation(conversationList[0]);
        await loadMessages(conversationList[0].id);
      }
    } catch (error) {
      console.error(error);
      alert("Error cargando mensajes.");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        alert(error.message);
        return;
      }

      setMessages((data || []) as Message[]);

      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId);
    } catch (error) {
      console.error(error);
      alert("Error cargando conversación.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setActiveConversation(conversation);
    await loadMessages(conversation.id);

    window.history.replaceState(
      null,
      "",
      `/cuenta?tab=mensajes&conversation=${conversation.id}`
    );
  };

  const sendMessage = async () => {
    if (!activeConversation) return;

    if (!newMessage.trim()) {
      alert("Escribe un mensaje.");
      return;
    }

    setSending(true);

    try {
      const { error: messageError } = await supabase.from("messages").insert({
        conversation_id: activeConversation.id,
        sender_id: userId,
        message: newMessage.trim(),
      });

      if (messageError) {
        alert(messageError.message);
        return;
      }

      const { error: updateError } = await supabase
        .from("conversations")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeConversation.id);

      if (updateError) {
        console.error(updateError.message);
      }

      setNewMessage("");
      await loadMessages(activeConversation.id);
      await loadConversations();
    } catch (error) {
      console.error(error);
      alert("Error enviando mensaje.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-600">Cargando mensajes...</p>;
  }

  if (conversations.length === 0) {
    return (
      <section>
        <h2 className="mb-2 text-xl font-bold">Mensajes</h2>

        <div className="rounded-xl bg-slate-50 p-5">
          <p className="text-sm text-slate-600">
            Todavía no tienes conversaciones.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-2 text-xl font-bold">Mensajes</h2>

      <p className="mb-5 text-sm text-slate-600">
        Revisa tus conversaciones con compradores y vendedores.
      </p>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <h3 className="font-bold">Conversaciones</h3>
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            {conversations.map((conversation) => {
              const isActive = activeConversation?.id === conversation.id;
              const car = conversation.cars;
              const isSeller = conversation.seller_id === userId;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => selectConversation(conversation)}
                  className={`block w-full border-b p-4 text-left hover:bg-slate-50 ${
                    isActive ? "bg-blue-50" : "bg-white"
                  }`}
                >
                  <p className="font-semibold text-slate-900">
                    {car
                      ? `${car.brand} ${car.model} ${car.year}`
                      : "Publicación"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {isSeller ? "Comprador interesado" : "Vendedor"}
                  </p>

                  {car && (
                    <p className="mt-1 text-sm font-semibold text-blue-700">
                      ${car.price.toLocaleString("es-CL")}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-slate-400">
                    Última actualización:{" "}
                    {new Date(conversation.updated_at).toLocaleDateString(
                      "es-CL"
                    )}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="rounded-2xl border bg-white shadow-sm">
          {activeConversation ? (
            <>
              <div className="border-b p-4">
                <h3 className="font-bold">
                  {activeConversation.cars
                    ? `${activeConversation.cars.brand} ${activeConversation.cars.model} ${activeConversation.cars.year}`
                    : "Conversación"}
                </h3>

                <p className="text-sm text-slate-500">
                  {activeConversation.seller_id === userId
                    ? "Estás respondiendo como vendedor"
                    : "Estás conversando con el vendedor"}
                </p>
              </div>

              <div className="max-h-[460px] min-h-[360px] overflow-y-auto bg-slate-50 p-4">
                {loadingMessages ? (
                  <p className="text-sm text-slate-600">
                    Cargando conversación...
                  </p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    Todavía no hay mensajes en esta conversación.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => {
                      const isMine = message.sender_id === userId;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                              isMine
                                ? "bg-blue-700 text-white"
                                : "bg-white text-slate-800 shadow-sm"
                            }`}
                          >
                            <p className="whitespace-pre-line">
                              {message.message}
                            </p>

                            <p
                              className={`mt-1 text-[11px] ${
                                isMine ? "text-blue-100" : "text-slate-400"
                              }`}
                            >
                              {new Date(message.created_at).toLocaleString(
                                "es-CL"
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t p-4">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2"
                />

                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={sending}
                  className="mt-3 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400"
                >
                  {sending ? "Enviando..." : "Enviar mensaje"}
                </button>
              </div>
            </>
          ) : (
            <div className="p-5 text-sm text-slate-600">
              Selecciona una conversación.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}