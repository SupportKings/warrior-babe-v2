"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { deleteProduct } from "@/features/products/actions/deleteProduct";
import { useProduct } from "@/features/products/queries/useProducts";

import { Trash2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { ProductDeleteModal } from "../components/product.delete.modal";

interface ProductDetailHeaderProps {
	productId: string;
}

export default function ProductDetailHeader({
	productId,
}: ProductDetailHeaderProps) {
	const { data: product } = useProduct(productId);
	const router = useRouter();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean | null>(
		false,
	);

	const { execute: executeDeleteProduct, isExecuting } = useAction(
		deleteProduct,
		{
			onSuccess: () => {
				setIsDeleteDialogOpen(false);
				toast.success(
					`${product?.name || "Product"} has been deleted successfully`,
				);
				router.push("/dashboard/system-config/products");
			},
			onError: (error) => {
				console.error("Failed to delete product:", error);
				toast.error("Failed to delete product. Please try again.");
			},
		},
	);

	const handleDeleteProduct = () => {
		console.log(productId);
		executeDeleteProduct({ id: productId });
	};

	return (
		<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<BackButton />
				<h1 className="font-medium text-[13px]">
					{product?.name
						? `${product.name} - ${product.is_active ? "Active" : "Inactive"}`
						: "Product Details"}
				</h1>
			</div>
			<Button
				onClick={() => setIsDeleteDialogOpen(true)}
				variant="destructive"
				className="flex items-center gap-2"
			>
				<Trash2Icon className="mr-[6px] h-4 w-4" />
				Delete Product
			</Button>
			{isDeleteDialogOpen && (
				<ProductDeleteModal
					product={product as any}
					open={!!product}
					onOpenChange={(open) => !open && setIsDeleteDialogOpen(null)}
					onConfirm={async () => {
						const productId = product?.id;
						const productName = product?.name;

						if (!productId) {
							toast.error("Product ID is missing");
							throw new Error("Product ID is missing");
						}

						try {
							handleDeleteProduct();
						} catch (error) {
							// Show error toast
							toast.error(`Failed to delete ${productName}. Please try again.`);
							throw error;
						}
					}}
				/>
			)}
		</div>
	);
}
