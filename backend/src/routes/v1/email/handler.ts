import { addEmailJob } from "@/jobs/email-queue";
import { emailStatus } from "@/utils/enum";
import { Request, Response } from "express";
import { insertEmailsQuery } from "./queries";

export async function sendEmailHandler(req: Request, res: Response) {
  try {
    const payload = {
      templateId: 1,
      to: "prajapatianurag73240@gmail.com",
      subject: "test",
    };
    const insertResult = await insertEmailsQuery([
      {
        ...payload,
        emailStatus: emailStatus.PENDING,
      },
    ]);
    const emailId =
      (await insertResult.length) > 0 ? insertResult[0]?.insertId : null;

    if (!emailId)
      return res
        .status(500)
        .json({ success: false, message: "Something went wrong", data: null });

    await addEmailJob({
      emailId,
      templateId: 1,
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
