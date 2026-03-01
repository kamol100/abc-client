import StaffForm from "@/components/staffs/staff-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function StaffEdit({ params }: Props) {
  const { id } = await params;

  return <StaffForm mode="edit" data={{ id }} />;
}
