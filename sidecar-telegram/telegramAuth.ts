import { TelegramClient, Api } from "telegram"
import { StringSession } from "telegram/sessions"

interface AuthResult {
  success: boolean
  message: string
  sessionId?: string | void
  requires2FA?: boolean
  phoneCodeHash?: string
}

//TODO
//use env or stronghold for this 
let API_ID=
let API_HASH=

export async function initializeTelegramClient(sessionId: string) {
  return new TelegramClient(new StringSession(sessionId || ""), Number.parseInt(API_ID as string), API_HASH as string, {
    connectionRetries: 5,
  });

}

export async function sendCode(sessionId: string, phoneNumber: string): Promise<AuthResult> {
  const client = await initializeTelegramClient(sessionId)

  try {
    await client.connect()
    const result = await client.sendCode( {
        apiId: Number.parseInt(API_ID),
        apiHash: API_HASH,
      }, phoneNumber);

    const sessionId = client.session.save();
    return { success: true, sessionId: sessionId, message: "Code sent successfully", phoneCodeHash: result.phoneCodeHash }
  } catch (error) {


    if (error instanceof Error) {
      return { success: false, message: error.message }
    }
    return { success: false, message: "failed to send code" }

  } finally {
    await client.disconnect()
  }
}

export async function verifyCode(sessionId: string, phoneNumber: string, phoneCode: string, phoneCodeHash: string): Promise<AuthResult> {
  const client = await initializeTelegramClient(sessionId)

  try {
    await client.connect()
    const result = await client.invoke(
      new Api.auth.SignIn({
        phoneNumber,
        phoneCodeHash,
        phoneCode,
      }),
    )

    const sessionId = client.session.save()

    if ("password" in result) {
      return {
        success: true,
        message: "2FA required",
       requires2FA: true,
       sessionId: sessionId,
      }
    }


    return {
      success: true,
      message: "Logged in successfully",
      sessionId,
    }
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      if (error.message.includes("SESSION_PASSWORD_NEEDED")) {
        return { success: true, sessionId: sessionId, requires2FA: true, message: error.message }
      }
    }
    return { success: false, message: "failed to verify code" }
  } finally {
    await client.disconnect()
  }
}

export async function verify2FA(sessionId: string, password: string): Promise<AuthResult> {
  const client = await initializeTelegramClient(sessionId)

  try {
    await client.connect()
    const user = await client.signInWithPassword(
      {
        apiId: Number.parseInt(API_ID as string),
        apiHash: API_HASH,
      }, {
      password: async () => password,
      onError: (error) => console.error("Error signing in with password:", error),
    });

    const sessionId = client.session.save()

    return {
      success: true,
      message: "Logged in successfully",
      sessionId,
    }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message }
    }
    return { success: false, message: "failed to verify 2FA" }
  } finally {
    await client.disconnect()
  }
}

export async function getUserInfo(sessionId: string) {
  const client = await initializeTelegramClient(sessionId)

  try {
    await client.connect()
    const me = await client.getMe()

    return {
      success: true,
      username: me.username,
    }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message }
    }
    return { success: false, message: "failed to fetch user info" }
  } finally {
    await client.disconnect()
  }
}
