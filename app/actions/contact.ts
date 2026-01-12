"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function submitContactMessage(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return { error: "Unauthorized" }
  }

  const subject = formData.get("subject") as string
  const content = formData.get("content") as string

  if (!subject || !content) {
    return { error: "Veuillez remplir tous les champs" }
  }

  try {
    await prisma.message.create({
      data: {
        userId: session.user.id,
        subject,
        content
      }
    })

    revalidatePath("/admin")
    return { success: "Message envoyé avec succès. Un administrateur vous recontactera bientôt." }
  } catch (error) {
    console.error("Contact Error:", error)
    return { error: "Une erreur est survenue lors de l'envoi du message." }
  }
}
