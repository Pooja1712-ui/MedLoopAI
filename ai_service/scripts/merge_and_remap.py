import os
import shutil

source_info = [
    (0, 'wheelchair'),
    (1, 'cylinder'),
    (2, 'medicine'),
    (3, 'crutch')
]

for class_index, name in source_info:
    # Validation images & labels
    img_src_val_dir = f'F:/DetectMedicalDevicesAndMedicine/datasets/{name}/valid/images'
    lbl_src_val_dir = f'F:/DetectMedicalDevicesAndMedicine/datasets/{name}/valid/labels'

    dst_img_val_dir = r'F:\DetectMedicalDevicesAndMedicine\datasets\images\val'
    dst_lbl_val_dir = r'F:\DetectMedicalDevicesAndMedicine\datasets\labels\val'
    os.makedirs(dst_img_val_dir, exist_ok=True)
    os.makedirs(dst_lbl_val_dir, exist_ok=True)

    for f in os.listdir(img_src_val_dir):
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
            shutil.copy(os.path.join(img_src_val_dir, f), dst_img_val_dir)
            # Copy & remap label
            label_file = f.replace('.jpg','.txt').replace('.jpeg','.txt').replace('.png','.txt').replace('.bmp','.txt')
            src_label_path = os.path.join(lbl_src_val_dir, label_file)
            dst_label_path = os.path.join(dst_lbl_val_dir, label_file)
            if os.path.exists(src_label_path):
                with open(src_label_path, 'r') as infile:
                    lines = []
                    for line in infile:
                        parts = line.strip().split()
                        parts[0] = str(class_index)
                        lines.append(' '.join(parts))
                with open(dst_label_path, 'w') as outfile:
                    outfile.write('\n'.join(lines))


print("Merged images and labels, and remapped classes successfully.")
