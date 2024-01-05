import SettingIcon from './SettingIcon';
import { DropdownMenu, DropdownContent, DropdownTrigger } from './DropdownMenu';
import ToggleTracking from './ToggleTracking';
import GetYoutubeWords from './GetYoutubeWords';
import ValidateVocab from './ValidateVocab';

export default function Setting({ words }: { words: string[] }) {
  return (
    <DropdownMenu placement='bottom-start'>
      <DropdownTrigger>
        <SettingIcon />
      </DropdownTrigger>
      <DropdownContent className='flex flex-col bg-white p-4 rounded-md shadow-lg space-y-4'>
        <ToggleTracking />
        <GetYoutubeWords />
        <ValidateVocab words={words} />
      </DropdownContent>
    </DropdownMenu>
  );
}
