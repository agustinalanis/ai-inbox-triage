import type { Classification } from '../classifier/classifier.service.js';

export interface SeedMessage extends Omit<Classification, 'latencyMs'> {
  /** Stable key: with the session id it gives the message a deterministic id. */
  key: string;
  businessId: string;
  senderName: string | null;
  text: string;
  minutesAgo: number;
}

const MODEL = 'gemini-3.5-flash-lite';

// Already classified, so a first visit shows a full inbox without calling Gemini.
export const SEED_MESSAGES: SeedMessage[] = [
  {
    key: 'consultorio-crisis',
    businessId: 'consultorio',
    senderName: null,
    text: 'Mi papá tiene un dolor fuerte en el pecho y le cuesta respirar, ¿qué hacemos?',
    category: 'crisis',
    priority: 'urgent',
    extracted: {},
    suggestedReply: null,
    needsHuman: true,
    confidence: 0.97,
    model: MODEL,
    minutesAgo: 12,
  },
  {
    key: 'consultorio-new-appointment',
    businessId: 'consultorio',
    senderName: 'Laura Gómez',
    text: 'Hola, quisiera sacar un turno con clínica médica para el martes a la mañana. Tengo OSDE.',
    category: 'new-appointment',
    priority: 'normal',
    extracted: {
      patientName: 'Laura Gómez',
      preferredDate: 'martes a la mañana',
      insurance: 'OSDE',
    },
    suggestedReply:
      'Hola Laura, gracias por escribirnos. Recibimos tu pedido de turno con clínica médica para el martes a la mañana con OSDE. ' +
      'El equipo va a revisar la disponibilidad y te va a contactar para confirmarlo.',
    needsHuman: true,
    confidence: 0.93,
    model: MODEL,
    minutesAgo: 45,
  },
  {
    key: 'consultorio-reschedule',
    businessId: 'consultorio',
    senderName: 'Martín',
    text: 'Tengo turno el jueves 14 a las 10 pero no llego, ¿lo puedo pasar al viernes?',
    category: 'reschedule-appointment',
    priority: 'high',
    extracted: { currentDate: 'jueves 14 a las 10', preferredDate: 'viernes' },
    suggestedReply:
      'Hola Martín, recibimos tu pedido para cambiar el turno del jueves 14 a las 10 al viernes. ' +
      '¿Tenés preferencia de horario? El equipo te va a confirmar las opciones disponibles.',
    needsHuman: true,
    confidence: 0.9,
    model: MODEL,
    minutesAgo: 90,
  },
  {
    key: 'consultorio-thanks',
    businessId: 'consultorio',
    senderName: 'Rosa',
    text: '¡Muchas gracias por la atención de ayer, la doctora fue muy amable!',
    category: 'general',
    priority: 'low',
    extracted: {},
    suggestedReply:
      '¡Gracias por tu mensaje, Rosa! Nos alegra que la atención haya sido buena. Se lo vamos a transmitir a la doctora.',
    needsHuman: false,
    confidence: 0.88,
    model: MODEL,
    minutesAgo: 180,
  },
  {
    key: 'academia-wellbeing',
    businessId: 'academia',
    senderName: null,
    text: 'Ya no puedo más con todo, siento que nada tiene sentido y no sé con quién hablar.',
    category: 'wellbeing-risk',
    priority: 'urgent',
    extracted: {},
    suggestedReply: null,
    needsHuman: true,
    confidence: 0.95,
    model: MODEL,
    minutesAgo: 8,
  },
  {
    key: 'academia-exams',
    businessId: 'academia',
    senderName: 'Julián Pereyra',
    text: 'Hola, rendí el final de Análisis II el 3 de julio y todavía no aparece la nota. Legajo 48213.',
    category: 'exams-grades',
    priority: 'normal',
    extracted: {
      course: 'Análisis II',
      examDate: '3 de julio',
      studentId: '48213',
    },
    suggestedReply:
      'Hola Julián, gracias por avisarnos. Recibimos tu consulta por la nota del final de Análisis II del 3 de julio (legajo 48213). ' +
      'El equipo lo va a revisar y te va a responder a la brevedad.',
    needsHuman: true,
    confidence: 0.91,
    model: MODEL,
    minutesAgo: 60,
  },
  {
    key: 'academia-certificate',
    businessId: 'academia',
    senderName: 'Camila',
    text: 'Necesito un certificado de alumna regular para presentar en el trabajo.',
    category: 'certificates',
    priority: 'normal',
    extracted: { document: 'certificado de alumna regular' },
    suggestedReply:
      'Hola Camila, recibimos tu pedido de certificado de alumna regular. ¿Nos pasás tu número de legajo? ' +
      'Con ese dato el equipo lo gestiona y te avisa.',
    needsHuman: true,
    confidence: 0.94,
    model: MODEL,
    minutesAgo: 150,
  },
  {
    key: 'academia-thanks',
    businessId: 'academia',
    senderName: 'Pedro',
    text: 'Listo, ya pude inscribirme a las materias. ¡Gracias por la ayuda!',
    category: 'general',
    priority: 'low',
    extracted: {},
    suggestedReply:
      '¡Qué bueno, Pedro! Gracias por avisarnos. Cualquier otra consulta, escribinos.',
    needsHuman: false,
    confidence: 0.89,
    model: MODEL,
    minutesAgo: 240,
  },
];
