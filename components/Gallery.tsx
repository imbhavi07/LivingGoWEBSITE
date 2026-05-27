import Image from "next/image";

type GalleryProps = {
  images: string[];
  title: string;
};

export function Gallery({ images, title }: GalleryProps) {
  return (
    <section className="grid gap-3 overflow-hidden rounded-3xl md:grid-cols-[1.4fr_1fr]">
      <div className="relative min-h-[320px] md:min-h-[460px]">
        <Image src={images[0]} alt={title} fill priority className="object-cover" sizes="(min-width: 768px) 60vw, 100vw" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
        {images.slice(1, 3).map((image, index) => (
          <div key={image} className="relative min-h-40 md:min-h-0">
            <Image src={image} alt={`${title} view ${index + 2}`} fill className="object-cover" sizes="(min-width: 768px) 40vw, 50vw" />
          </div>
        ))}
      </div>
    </section>
  );
}
