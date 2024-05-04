const logger = require('../src/core/logger')('api');
const { Account } = require('../src/models');
const { hashAccessCode } = require('../src/utils/access-code');
const { hashPin } = require('../src/utils/pin');

//Account 1
const name = 'Natanael Sion';
const email = 'natanaelsion@gmail.com';
const ktp = {
  nik: '3171234567890123',
  place_ob: 'Jakarta',
  date_ob: '18-02-2000',
  gender: 'L',
  blood_type: 'AB',
  address: 'Jakarta Barat',
};
const phone_number = '0123-4567-8901';
const balance = 250000;
const pin = '123456';
const access_code = 'def123';

//Account 2
const name2 = 'Lidya Ruth';
const email2 = 'lidyaruth@gmail.com';
const ktp2 = {
  nik: '3172181931031876',
  place_ob: 'Bandung',
  date_ob: '21-09-2002',
  gender: 'P',
  blood_type: 'O',
  address: 'Bandung Selatan',
};
const phone_number2 = '0856-8129-4391';
const balance2 = 300000;
const pin2 = '654321';
const access_code2 = 'dec456';

logger.info('Creating default accounts');

(async () => {
  try {
    const numAccounts = await Account.countDocuments();

    if (numAccounts > 1) {
      throw new Error(`Account ${email} & ${email2} already exists`);
    }

    const hashedPin = await hashPin(pin);
    const hashedPin2 = await hashPin(pin2);
    const hashedAccessCode = await hashAccessCode(access_code);
    const hashedAccessCode2 = await hashAccessCode(access_code2);
    await Account.create({
      account_number: '0001',
      name,
      email,
      ktp,
      phone_number,
      balance,
      pin: hashedPin,
      access_code: hashedAccessCode,
    });
    await Account.create({
      account_number: '0002',
      name: name2,
      email: email2,
      ktp: ktp2,
      phone_number: phone_number2,
      balance: balance2,
      pin: hashedPin2,
      access_code: hashedAccessCode2,
    });
  } catch (e) {
    logger.error(e);
  } finally {
    process.exit(0);
  }
})();
