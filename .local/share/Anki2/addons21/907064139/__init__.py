# -*- coding: utf-8 -*-
# Copyright: Nick Youngblood <osunightfall@gmail.com>
# License: GNU GPL, version 3 or later; http://www.gnu.org/copyleft/gpl.html
#
# Automatic flashcard creation using Jisho.org
#
# See http://ankiweb.net/shared/info/1545080191 for official download
#---------------------------------------------------------------------------

import sys, os, platform, re, subprocess, json, urllib.request, urllib.parse, urllib.error
from aqt.utils import showInfo
from anki.utils import stripHTML, isWin, isMac
from anki.hooks import addHook

# Usage: To use this addon, create a new flashcard with a note type containing the 
# word 'japanese'. Type the word you want to create a new card for into the field
# with the same name as the 'triggerNoteFieldName' variable below. By default, 
# the 'Expression' field is used. The initial term you enter into the card's 
# field can be in full Japanese, in kana, in romaji, or even in English. 
# When you tab or click out of the field, this addon will automatically query 
# Jisho.org for information about the word. If you entered the word in a non-standard
# way, this addon will replace what you typed with the proper form of the word as 
# returned by the Jisho.org search API. (Ex. Typing 'house' into the field then 
# tabbing out will cause what you typed to be replaced with '家', and will additionally
# fill in the other fields on the card as appropriate. The fields will be filled 
# with information from the *first* result returned by the Jisho.org search API, 
# so if the wrong information comes back, try altering the text you're using.
# The field which triggers the# addon, as well as what information goes in which field, 
# can be changed as described below. Note that this addon *requires* an active
# internet connection to function.

# Enable/Disable Auto Generation: By right-clicking while creating a new card, 
# you can enable and disable the addon as needed to make manual changes to 
# card fields without the addon stepping on your toes.

# This addon is fully compatible with the furigana lookup function of the 
# 'Japanese Language Support' addon, and the two should not normally interfere with 
# each other. By default, they trigger off of the same card field and apply 
# to the same types of cards.

# Trigger Field: By default, the addon runs when the user tabs out of 
# the 'Expression' field after entering some text. To change which field 
# triggers the addon, change the variable below to the name of the field
# you want to use.

triggerNoteFieldName = 'Expression' # Script is run when tabbing out of this field

# The noteNameIdentifier is a string that must exist in the name of your note type for 
# this script to be executed for that note type. By default, any note type whose name 
# contains the word 'japanese' will attempt to execute this script, just like the 
# Japanese Language Support plugin.

noteNameIdentifier = 'japanese'

# Default Supported Fields: 
# The word is placed in the 'Expression' field
# The first definition is placed in the 'Meaning' field
# The second definition is placed in the '2ndDef' field
# The part of speech is placed in the 'PartOfSpeech' field
# The first tag is placed in the 'Tags' field
# The first restriction is placed in the 'Restrictions' field
# The first antonym is placed in the 'Antonyms' field
# The first info is placed in the 'Info' field
# The reading of the word is placed in the 'Reading' field, 
#   unless the Japanese Language Support addon is installed.
#
# These mappings can be changed by changing the field names below. 
# For example, if the name of your second definition field were 
# 'Definition2', you would change '2ndDef' below to 'Definition2'.
# If you don't wish to use a mapping, just change the field name to 
# ''. Fields fail silently, so just put the fields on your note type
# that you intend to use.

wordNoteFieldName = 'Expression'
definitionNoteFieldName = 'Meaning'
definition2NoteFieldName = '2ndDef'
partOfSpeechFieldName = 'PartOfSpeech'
tagsFieldName = 'Tags'
restrictionsFieldName = 'Restrictions'
antonymsFieldName = 'Antonyms'
infoFieldName = 'Info'
readingFieldName = 'Reading'
jishoReadingFieldName = 'JishoReading' # Added this field so that you can use
                                       # the Japanese Support Addon reading and
                                       # the Jisho reading concurrently

global editorWindow

def nryFillNoteFields(flag):
    global editorWindow

    from aqt import mw
    from aqt import editor
    n = editorWindow.editor.note

    # japanese model?
    if noteNameIdentifier not in n.model()['name'].lower():
        return flag
    # trigger field exists?
    for c, name in enumerate(mw.col.models.fieldNames(n.model())):
        if name == triggerNoteFieldName:
            src = triggerNoteFieldName
            srcIdx = c
    try:
        if not src:
            return flag
    except UnboundLocalError:
            showInfo("Your note type must contain a field named '" + triggerNoteFieldName + "' in order to trigger automatic flashcard generation, but no such field exists on the current note type '" + noteNameIdentifier + "'. To change which field is used to trigger the addon, edit the addon through the 'Tools->Add-ons->jp_auto_card_generation->Edit' menu option on the main page, and follow the directions in the comments. Auto-generation will be turned off until re-enabled.")
            clearAllFields(n)
            return flag
    # set field index of source string field for JLS integration
    fidx = srcIdx
    # grab search string
    srcTxt = mw.col.media.strip(n[src])
    if not srcTxt:
        return flag
    
    searchString = srcTxt

    # result holders for API call
    word = ''
    definition = ''
    definition2 = ''
    partOfSpeech = ''
    reading = ''
    tags = ''
    restrictions = ''
    antonyms = ''
    info = ''
    
    baseUrl = 'http://jisho.org/api/v1/search/words?keyword='

    # Make url conform to ASCII 
    encodedUrl = baseUrl + urllib.parse.quote(searchString.encode('utf8'))
    try:
        response = urllib.request.urlopen(encodedUrl).read()
        parsed_json = json.loads(response)
    except IOError:
        showInfo('You must have an active internet connection to use automatic card generation. Auto-generation will be turned off until re-enabled.')
        clearAllFields(n)
        return flag

    # Exit if nothing useful came back
    try: 
        responseHasResults = parsed_json['data'][0]
    except IndexError:
        showInfo("Jisho.org returned no data for search term '" + searchString + "'")
        clearAllFields(n)
        return flag

    try: # Get proper word if it was typed with kana and should have kanji, or 
         # hiragana to katakana, or romaji to anything, etc
        word = parsed_json["data"][0]['japanese'][0]['word']
    except (IndexError, KeyError):
        try: # Katakana search terms put the word elsewhere
            word = parsed_json["data"][0]['japanese'][0]['reading']
        except (IndexError, KeyError):
            pass
    
    clearAllFields(n)

    if len(word) > 0:
        try:
            n[wordNoteFieldName] = word
            flag = True
        except KeyError:
            pass

    # ----- 'japanese language support' addon integration
    # This code allows this addon to work side-by-side with the 
    # 'japanese language support' addon. The only conflict between
    # the two is that this addon allows you to enter any text
    # into the triggering field, even english words, and 
    # end up with a japanese flashcard. However, the order of 
    # execution between this addon and the JLS addon cannot be 
    # guaranteed, leading to situations like typing in 'house'
    # and ending up with the JLS addon trying to get a japanese
    # reading for 'house' because it was executed before this addon
    # could replace 'house' with '家', which the JLS addon 
    # would correctly process. Therefore, we clear out the reading
    # field(s) from the JLS addon, and call its functionality 
    # manually after we've replaced the entered text with a proper
    # japanese word, so that the reading will be generated correctly.
    JLSAddonInstalled = False
    try:
        from japanese.reading import onFocusLost, srcFields, dstFields
        JLSAddonInstalled = True
        # if the import fails, the JLS addon isn't installed, so we 
        # continue processing.

        # if our trigger field is one of the JLS addon's source fields, 
        # we clear out all its source and destination fields before 
        # we call it directly with our new value.
        if triggerNoteFieldName in srcFields:
            for srcField in srcFields:
                try:
                    if srcField != triggerNoteFieldName:
                        n[srcField] = word
                except KeyError:
                    pass
            for dstField in dstFields:
                try:
                    n[dstField] = ''
                except KeyError:
                    pass

            # onFocusLost is the function in the JLS addon that is 
            # called to go get the furigana for a word
            onFocusLost(flag, n, fidx)
    except ImportError: # Japanese Language Support not installed
        pass
    # ----- end 'japanese language support' addon integration

    # Get the first definition if it exists
    try:
        definitionList = parsed_json["data"][0]['senses'][0]['english_definitions']
        for defWord in definitionList:
            if (len(definition) > 0):
                definition = definition + ', '
            definition = definition + defWord
 
    except (IndexError, KeyError):
        pass

    # Get the second definition if it exists
    try:
      definition2List = parsed_json["data"][0]['senses'][1]['english_definitions']
      for defWord in definition2List:
        if (len(definition2) > 0):
          definition2 = definition2 + ', '
        definition2 = definition2 + defWord
    except (IndexError, KeyError):
      pass

    # Get the part of speech string if it exists
    try:
      partOfSpeech = parsed_json["data"][0]['senses'][0]['parts_of_speech'][0]
    except (IndexError, KeyError):
      pass    

    # Get the reading string if it exists
    try:
      reading = parsed_json["data"][0]['japanese'][0]['reading']
    except (IndexError, KeyError):
      pass    

    # Get the tags string if it exists
    try:
      tags = parsed_json["data"][0]['senses'][0]['tags'][0]
    except (IndexError, KeyError):
      pass    

    # Get the restrictions string if it exists
    try:
      restrictions = parsed_json["data"][0]['senses'][0]['restrictions'][0]
    except (IndexError, KeyError):
      pass    

    # Get the antonyms string if it exists
    try:
      antonyms = parsed_json["data"][0]['senses'][0]['antonyms'][0]
    except (IndexError, KeyError):
      pass    

    # Get the info string if it exists
    try:
      info = parsed_json["data"][0]['senses'][0]['info'][0]
    except (IndexError, KeyError):
      pass    
    
    if len(definition) > 0:
        try:
            n[definitionNoteFieldName] = definition
            flag = True
        except KeyError:
            pass

    if len(definition2) > 0:
        try:
            n[definition2NoteFieldName] = definition2
            flag = True
        except KeyError:
            pass

    if len(partOfSpeech) > 0:
        try:
            n[partOfSpeechFieldName] = partOfSpeech     
            flag = True 
        except KeyError:
            pass

    if len(reading) > 0:
        try:
            if JLSAddonInstalled == False:
                n[readingFieldName] = reading
            n[jishoReadingFieldName] = reading
            flag = True
        except KeyError:
            pass

    if len(tags) > 0:
        try:
            n[tagsFieldName] = tags     
            flag = True 
        except KeyError:
            pass

    if len(restrictions) > 0:
        try:
            n[restrictionsFieldName] = restrictions     
            flag = True
        except KeyError:
            pass

    if len(antonyms) > 0:
        try:
            n[antonymsFieldName] = antonyms     
            flag = True
        except KeyError:
            pass

    if len(info) > 0:
        try:
            n[infoFieldName] = info     
            flag = True 
        except KeyError:
            pass
    if flag == True:
      editorWindow.editor.loadNote()
    return flag

def nryContextMenuEvent(self, menu):
    global editorWindow
    editorWindow = self
    b = menu.addAction(_("Fill note fields using Jisho.org"))
    b.triggered.connect(nryFillNoteFields)

def clearCardField(note, fieldName):
    try:
        note[fieldName] = ''
    except KeyError:
        pass

def clearAllFields(note):
    # clear fields before we fill them so that 
    # multiple searches on the same card don't 
    # contain partial data from previous searches
    
    clearCardField(note, definitionNoteFieldName)
    clearCardField(note, definition2NoteFieldName)
    clearCardField(note, partOfSpeechFieldName)
    clearCardField(note, tagsFieldName)
    clearCardField(note, restrictionsFieldName)
    clearCardField(note, antonymsFieldName)
    clearCardField(note, infoFieldName)
    clearCardField(note, readingFieldName)
    
# Init
##########################################################################

addHook('EditorWebView.contextMenuEvent', nryContextMenuEvent)