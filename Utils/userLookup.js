import user from './../Models/user.js'

export async function getSenderAndReceiver(senderUid, receiverUid) {
  const [sender, receiver] = await Promise.all([
    User.findOne({ where: { uid: senderUid } }),
    User.findOne({ where: { uid: receiverUid } }),
  ]);

  if (!sender || !receiver) {
    throw new Error(
      `User lookup failed | sender=${senderUid}, receiver=${receiverUid}`
    );
  }

  return { sender, receiver };
}
