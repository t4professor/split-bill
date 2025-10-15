import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Member {
  id: string;
  name: string;
}

interface MemberSelectorProps {
  members: Member[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  multiple?: boolean;
}

export function MemberSelector({
  members,
  value,
  onChange,
  label,
  placeholder = "Chọn thành viên",
  required = false,
  multiple = false,
}: MemberSelectorProps) {
  const selectedIds = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value
    ? [value as string]
    : [];

  const handleSelect = (memberId: string) => {
    if (multiple) {
      const newIds = selectedIds.includes(memberId)
        ? selectedIds.filter((id) => id !== memberId)
        : [...selectedIds, memberId];
      onChange(newIds);
    } else {
      onChange(memberId);
    }
  };

  const removeMember = (memberId: string) => {
    if (multiple) {
      onChange(selectedIds.filter((id) => id !== memberId));
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Select
        value={!multiple ? (value as string) : undefined}
        onValueChange={handleSelect}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder}></SelectValue>
        </SelectTrigger>
        <SelectContent>
          {members.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              {member.name}
              {multiple && selectedIds.includes(member.id) && " ✓"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {multiple && selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedIds.map((id) => {
            const member = members.find((m) => m.id === id);
            return (
              <span
                key={id}
                className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md text-sm flex items-center gap-1"
              >
                {member?.name}
                <button
                  type="button"
                  onClick={() => removeMember(id)}
                  className="ml-1 text-red-500 hover:text-red-700 font-bold"
                  aria-label={`Xóa ${member?.name}`}
                >
                  &times;
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
