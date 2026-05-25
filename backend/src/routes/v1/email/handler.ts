import { sendEmail } from "@/email";
import { Request, Response } from "express";

export async function sendEmailHandler(req: Request, res: Response) {
  try {
    await sendEmail({
      to: "prajapatianurag73240@gmail.com",
      subject: "test",
      text: "Testing , Hello Anurag",
      html: `
        <h1>Testing</h1>
        <p>Hello Anurag</p>
        `,
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
