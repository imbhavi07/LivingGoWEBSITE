import { PrismaClient, GenderPreference } from "@prisma/client";

const prisma = new PrismaClient();

function getLocationCode(location: string) {
  const value = location.toLowerCase();

  if (value.includes("vijay nagar")) return "VN";
  if (value.includes("mp nagar")) return "MP";
  if (value.includes("arera")) return "AR";
  if (value.includes("indrapuri")) return "IN";
  if (value.includes("kolar")) return "KO";
  if (value.includes("malka ganj")) return "MG";
  if (value.includes("shakti nagar")) return "SN";
  if (value.includes("roop nagar")) return "RN";
  if (value.includes("kamla nagar")) return "KM";
  if (value.includes("nehru nagar")) return "NN";

  return "OT";
}

function getPreferenceCode(preference: GenderPreference) {
  switch (preference) {
    case "Boys":
      return "B";
    case "Girls":
      return "G";
    default:
      return "N/A";
  }
}

async function generateCode(
  location: string,
  preference: GenderPreference
) {
  while (true) {
    const random = Math.floor(
      100000 + Math.random() * 900000
    );

    const code =
      `${getLocationCode(location)}-${getPreferenceCode(preference)}-${random}`;

    const exists = await prisma.property.findFirst({
      where: {
        propertyCode: code
      }
    });

    if (!exists) return code;
  }
}

async function main() {
  const properties = await prisma.property.findMany();

  for (const property of properties) {
    if (property.propertyCode) continue;

    const propertyCode = await generateCode(
      property.location,
      property.preference
    );

    await prisma.property.update({
      where: {
        id: property.id
      },
      data: {
        propertyCode
      }
    });

    console.log(property.title, "->", propertyCode);
  }

  console.log("Done");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });