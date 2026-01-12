"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Mail, User, Clock } from "lucide-react"

interface Message {
  id: string
  subject: string
  content: string
  status: string
  createdAt: Date
  user: {
    name: string | null
    email: string
  }
}

export function AdminMessages({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Aucun message pour le moment</CardDescription>
            </CardHeader>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Messages & Demandes
        </CardTitle>
        <CardDescription>Gérez les demandes de contact et d'investissement</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Sujet</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((msg) => (
              <TableRow key={msg.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium flex items-center gap-1">
                        <User className="h-3 w-3" /> {msg.user.name || "Utilisateur"}
                    </span>
                    <span className="text-xs text-muted-foreground">{msg.user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{msg.subject}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">{msg.content}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(msg.createdAt), "d MMM yyyy, HH:mm", { locale: fr })}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={msg.status === "unread" ? "destructive" : "secondary"}>
                    {msg.status === "unread" ? "Nouveau" : "Lu"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
