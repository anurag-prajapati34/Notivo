import {
  getEmailCredsQuery,
  insertEmailCredsQuery,
  updateEmailCredsQuery,
} from "./queries";
import { EmailCredentials } from "./validator";

export const setEmailCredsService = async (
  input: EmailCredentials & { userId: number },
) => {
  try {
    const [emailCreds] = await getEmailCredsQuery({
      email: input.email,
    });

    if (emailCreds) {
      await updateEmailCredsQuery(emailCreds.emailCredsId, {
        ...input,
      });
    } else {
      await insertEmailCredsQuery(input);
    }
  } catch (error) {
    throw error;
  }
};
