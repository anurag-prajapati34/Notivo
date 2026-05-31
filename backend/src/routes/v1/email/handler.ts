import { sendEmail } from "@/email";
import { template } from "@/email/templates/test";
import { addEmailJob } from "@/jobs/email-queue";
import { Request, Response } from "express";

export async function sendEmailHandler(req: Request, res: Response) {
  try {
    await addEmailJob({
      templateId: "33e",
      to: "prajapatianurag73240@gmail.com",
      subject: "test",
    });
    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      data: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      data: null,
    });
  }
}
