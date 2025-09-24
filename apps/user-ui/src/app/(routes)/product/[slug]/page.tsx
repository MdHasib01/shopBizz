import { Metadata } from "next";
import axiosInstance from "@/utils/axiosInstance";

async function fetchProductDetails(slug: string) {
  const response = await axiosInstance.get(`/product/api/get-product/${slug}`);
  return response.data.product;
}

export async function generateMetaData({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await fetchProductDetails(params.slug);

  return {
    title: product?.title,
    description: product?.description,
    openGraph: {
      title: product?.title,
      description: product?.description,
      images: [product?.images?.[0]?.url],
      type: "website",
    },
  };
}
const Page = async ({ params }: { params: { slug: string } }) => {
  const productDetails = await fetchProductDetails(params?.slug);
  return <div>{params.slug}</div>;
};
