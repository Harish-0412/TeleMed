import { z } from "zod";
import { insertProfileSchema, insertPatientSchema, insertConsultationSchema, insertMessageSchema, profiles, patients, consultations, messages } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  profiles: {
    me: {
      method: "GET" as const,
      path: "/api/profiles/me",
      responses: {
        200: z.custom<typeof profiles.$inferSelect>().nullable(),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/profiles",
      input: insertProfileSchema,
      responses: {
        201: z.custom<typeof profiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  patients: {
    list: {
      method: "GET" as const,
      path: "/api/patients",
      responses: {
        200: z.array(z.custom<typeof patients.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/patients",
      input: insertPatientSchema,
      responses: {
        201: z.custom<typeof patients.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/patients/:id",
      responses: {
        200: z.custom<typeof patients.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  consultations: {
    list: {
      method: "GET" as const,
      path: "/api/consultations",
      input: z.object({
        status: z.enum(["pending", "active", "completed"]).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof consultations.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/consultations",
      input: insertConsultationSchema,
      responses: {
        201: z.custom<typeof consultations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/consultations/:id",
      responses: {
        200: z.custom<typeof consultations.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/consultations/:id",
      input: insertConsultationSchema.partial(),
      responses: {
        200: z.custom<typeof consultations.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  messages: {
    list: {
      method: "GET" as const,
      path: "/api/consultations/:id/messages",
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/consultations/:id/messages",
      input: insertMessageSchema,
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
