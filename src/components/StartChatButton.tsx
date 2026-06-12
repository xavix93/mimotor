"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type StartChatButtonProps = {
  carId: string;
  sellerId: string;
  carTitle: string;
};

export default function StartChatButton({
  carId,
  sellerId,
  carTitle,
}: StartChatButtonProps) {
  const [loading, setLoading] = useState(false);

  const startChat = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        alert(sessionError.message);
        setLoading(false);
        return;
      }

      const user = sessionData.session?.user;

      if (!user) {
        window.location.href = `/login?redirect=/autos/${carId}`;
        return;
      }

      if (user.id === sellerId) {
        alert("No puedes enviarte un mensaje a tu propia publicación.");
        setLoading(false);
        return;
      }

      const { data: existingConversation, error: existingError } =
        await supabase
          .from("conversations")
          .select("id")
          .eq("car_id", carId)
          .eq("buyer_id", user.id)
          .eq("seller_id", sellerId)
          .maybeSingle();

      if (existingError) {
        alert(existingError.message);
        setLoading(false);
        return;
      }

      if (existingConversation) {
        window.location.href = `/cuenta?tab=mensajes&conversation=${existingConversation.id}`;
        return;
      }

      const { data: newConversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          car_id: carId,
          buyer_id: user.id,
          seller_id: sellerId,
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (conversationError || !newConversation) {
        alert(conversationError?.message || "No se pudo crear el chat.");
        setLoading(false);
        return;
      }

      const { error: messageError } = await supabase.from("messages").insert({
        conversation_id: newConversation.id,
        sender_id: user.id,
        message: `Hola, me interesa el vehículo ${carTitle}. ¿Sigue disponible?`,
      });

      if (messageError) {
        alert(messageError.message);
        setLoading(false);
        return;
      }

      await supabase
        .from("conversations")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", newConversation.id);

      window.location.href = `/cuenta?tab=mensajes&conversation=${newConversation.id}`;
    } catch (error) {
      console.error(error);
      alert("Error iniciando el chat.");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={startChat}
      disabled={loading}
      className="mt-3 block w-full rounded-lg bg-blue-700 px-6 py-3 text-center font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400"
    >
      {loading ? "Abriendo chat..." : "Enviar mensaje al vendedor"}
    </button>
  );
}