import Image from "next/image";

interface TeamCardProps {
  name: string;
  role: string;
  designation?: string;
  image: string;
}

export default function TeamCard({
  name,
  role,
  designation,
  image,
}: TeamCardProps) {
  return (
    <div className="group rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
      <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      <div className="mt-5 text-center">
        <h3 className="text-xl font-bold">{name}</h3>

        <p className="mt-1 font-semibold text-primary">
          {role}
        </p>

        {designation && (
          <p className="mt-2 text-sm text-gray-500">
            {designation}
          </p>
        )}
      </div>
    </div>
  );
}