def change_file_name():
    sn_list = {
        'SK30221769': 'DEMO_000355',
        'SK30221762': 'DEMO_000362',
        'SK30221763': 'DEMO_000358',
        'SK30221767': 'DEMO_000359',
        'SK30221875': 'DEMO_000437',
        'SK30221764': 'DEMO_000356',
        'SK30221761': 'DEMO_000361',
        'SK30221766': 'DEMO_000363',
        'SK30221840': 'DEMO_000440',
        'SK30221770': 'DEMO_000364',
        'SK30221765': 'DEMO_000357',
        'SK30221768': 'DEMO_000360',
        'SK30221873': 'DEMO_000435',
        'SK30221874': 'DEMO_000436',
        'SK30125787': 'DEMO_000513',
        'SK30125811': 'DEMO_000514',
        'SK00103969': 'PYT3T_07126',
        'SK90904881': 'PYT3T_07129',
        'SK90904882': 'PYT3T_07148',
        'SK90904814': 'PYT3T_07149',
        'SK90904889': 'PYT3T_07184',
        'SK90904879': 'PYT3T_07185',
        'SK00103618': 'PYT3T_07188',
        'SK90904816': 'PYT3T_07198',
        'SK00103921': 'PYT3T_07213',
        'SK00103628': 'PYT3T_07214',
        'SK00103584': 'PYT3T_07228',
        'SK00103930': 'PYT3T_07231',
        'SK00104016': 'PYT3T_07245',
        'SK00104948': 'PYT3T_07246',
        'SK00104933': 'PYT3T_07263',
        'SK00104954': 'PYT3T_07264',
        'SK00104956': 'PYT3T_08911',
        'SK00104910': 'PYT3T_07281',
        'SK00103928': 'PYT3T_07295',
        'SK00103583': 'PYT3T_07313',
        'SK00103621': 'PYT3T_07327',
        'SK00103950': 'PYT3T_07328',
        'SK00103603': 'PYT3T_07345',
        'SK00103623': 'PYT3T_07346',
        'SK00103607': 'PYT3T_07360',
        'SK00103611': 'PYT3T_07363',
        'SK00440801': 'PYT3T_07377',
        'SK00440796': 'PYT3T_07378',
        'SK00440737': 'PYT3T_07395',
        'SK00440786': 'PYT3T_07396',
        'SK00440806': 'PYT3T_07426',
        'SK00105000': 'PYT3T_07427',
        'SK00440778': 'PYT3T_07444',
        'SK00440751': 'PYT3T_07445',
        'SK10112905': 'DEMO_000070',
        'SK10112973': 'DEMO_000071',
        'SK10112964': 'DEMO_000080',
        'SK10112910': 'DEMO_000076',
        'SK10113081': 'DEMO_000129',
        'SK10113115': 'DEMO_000130',
        'SK01003149': 'DEMO_000195',
        'SE8V99010398': 'PYT3T_09052',
        'SE8V05024306': 'PYT3T_09058',
        'SK30125808': 'DEMO_000510',
        'SK30125767': 'DEMO_000517',
        'SK90904842': 'PYT3T_07133',
        'SK90904847': 'PYT3T_07140',
        'SK90904864': 'PYT3T_07145',
        'SK90904871': 'PYT3T_07181',
        'SK90904873': 'PYT3T_07194',
        'SK00103920': 'PYT3T_07210',
        'SK00103927': 'PYT3T_07217',
        'SK00103606': 'PYT3T_07224',
        'SK00103925': 'PYT3T_07235',
        'SK00104009': 'PYT3T_07242',
        'SK00104947': 'PYT3T_07249',
        'SK00104958': 'PYT3T_07260',
        'SK00104925': 'PYT3T_07267',
        'SK00104922': 'PYT3T_07274',
        'SK00104934': 'PYT3T_07285',
        'SK00104949': 'PYT3T_07292',
        'SK00103579': 'PYT3T_07299',
        'SK00103589': 'PYT3T_07310',
        'SK00103945': 'PYT3T_07317',
        'SK00103624': 'PYT3T_07325',
        'SK00103958': 'PYT3T_07331',
        'SK00103610': 'PYT3T_07349',
        'SK00103627': 'PYT3T_07356',
        'SK00440765': 'PYT3T_07367',
        'SK00440735': 'PYT3T_07374',
        'SK00440790': 'PYT3T_07381',
        'SK00440813': 'PYT3T_07392',
        'SK00105008': 'PYT3T_07399',
        'SK00105002': 'PYT3T_07423',
        'SK00104960': 'PYT3T_07430',
        'SK00440789': 'PYT3T_07441',
        'SK00105065': 'PYT3T_07448',
        'SK00440748': 'PYT3T_07455',
        'SK00440721': 'PYT3T_07459',
        'SK10112949': 'DEMO_000081',
        'SK10112987': 'DEMO_000078',
        'SK10306878': 'DEMO_000126',
        'SK90902719': 'DEMO_000162',
        'SK01003247': 'DEMO_000191',
        'SK11200443': 'DEMO_000297',
        'SK90904852': 'PYT3T_07084',
        'SK90904835': 'PYT3T_07130',
        'SK00103932': 'PYT3T_07132',
        'SK90904883': 'PYT3T_07144',
        'SK90904855': 'PYT3T_07146',
        'SK90904825': 'PYT3T_07178',
        'SK90904850': 'PYT3T_07193',
        'SK90904836': 'PYT3T_07195',
        'SK00103605': 'PYT3T_07223',
        'SK00103931': 'PYT3T_07225',
        'SK00103941': 'PYT3T_07227',
        'SK00103968': 'PYT3T_07232',
        'SK00103985': 'PYT3T_07234',
        'SK00103976': 'PYT3T_07257',
        'SK00104003': 'PYT3T_07259',
        'SK00104915': 'PYT3T_07266',
        'SK00104919': 'PYT3T_07268',
        'SK00103949': 'PYT3T_07291',
        'SK00103953': 'PYT3T_07293',
        'SK00103965': 'PYT3T_07300',
        'SK00103944': 'PYT3T_07302',
        'SK00103586': 'PYT3T_07324',
        'SK00103596': 'PYT3T_07326',
        'SK00103924': 'PYT3T_07332',
        'SK00103956': 'PYT3T_07334',
        'SK00103619': 'PYT3T_07357',
        'SK00103939': 'PYT3T_07359',
        'SK00104973': 'PYT3T_07364',
        'SK00440780': 'PYT3T_07366',
        'SK00104987': 'PYT3T_07389',
        'SK00440809': 'PYT3T_07391',
        'SK00440771': 'PYT3T_07393',
        'SK00104965': 'PYT3T_07398',
        'SK00105080': 'PYT3T_07400',
        'SK00440816': 'PYT3T_07440',
        'SK00440750': 'PYT3T_07442',
        'SK00105108': 'PYT3T_07447',
        'SK00440787': 'PYT3T_07449',
        'SK10112950': 'DEMO_000069',
        'SK00103590': 'PYT3T_08955',
        'SE8V05024307': 'PYT3T_09053',
        'SE8V01013913': 'PYT3T_09055',
        'SK30125775': 'DEMO_000511',
        'SK30125819': 'DEMO_000518',
        'SK90904810': 'PYT3T_07134',
        'SK00103591': 'PYT3T_07136',
        'SK90904876': 'PYT3T_07142',
        'SK90904839': 'PYT3T_07174',
        'SK90904812': 'PYT3T_07176',
        'SK90904807': 'PYT3T_07191',
        'SK00103922': 'PYT3T_07219',
        'SK00103609': 'PYT3T_07221',
        'SK00103990': 'PYT3T_07236',
        'SK00104011': 'PYT3T_07238',
        'SK00103982': 'PYT3T_07253',
        'SK00103593': 'PYT3T_07255',
        'SK00104013': 'PYT3T_07270',
        'SK00103987': 'PYT3T_07272',
        'SK00103962': 'PYT3T_07287',
        'SK00104001': 'PYT3T_07289',
        'SK00104921': 'PYT3T_07304',
        'SK00103615': 'PYT3T_07306',
        'SK00103580': 'PYT3T_07319',
        'SK00103601': 'PYT3T_07322',
        'SK00103587': 'PYT3T_07336',
        'SK00103929': 'PYT3T_07338',
        'SK00103966': 'PYT3T_07353',
        'SK00103625': 'PYT3T_07355',
        'SK00104983': 'PYT3T_07368',
        'SK00104964': 'PYT3T_07370',
        'SK00105072': 'PYT3T_07372',
        'SK00440808': 'PYT3T_07385',
        'SK00105092': 'PYT3T_07387',
        'SK00440732': 'PYT3T_07421',
        'SK00105091': 'PYT3T_07434',
        'SK00105090': 'PYT3T_07436',
        'SK00440782': 'PYT3T_07438',
        'SK00440740': 'PYT3T_07451',
        'SK00440766': 'PYT3T_07453',
        'SK90902733': 'DEMO_000293',
        'SE8V05024305': 'PYT3T_09057',
        'SK90904866': 'PYT3T_07135',
        'SK90904819': 'PYT3T_07137',
        'SK90904828': 'PYT3T_07141',
        'SK90904897': 'PYT3T_07143',
        'SK00103942': 'PYT3T_07173',
        'SK90904900': 'PYT3T_07175',
        'SK00103940': 'PYT3T_07220',
        'SK00103934': 'PYT3T_07222',
        'SK00104951': 'PYT3T_07237',
        'SK00104950': 'PYT3T_07239',
        'SK00103972': 'PYT3T_07254',
        'SK00103967': 'PYT3T_07256',
        'SK00104931': 'PYT3T_07269',
        'SK00104937': 'PYT3T_07271',
        'SK00103975': 'PYT3T_07273',
        'SK00104008': 'PYT3T_07286',
        'SK00103604': 'PYT3T_07303',
        'SK00103613': 'PYT3T_07305',
        'SK00103581': 'PYT3T_07318',
        'SK00103933': 'PYT3T_07320',
        'SK00103955': 'PYT3T_07335',
        'SK00103598': 'PYT3T_07337',
        'SK00103959': 'PYT3T_07352',
        'SK00103951': 'PYT3T_07354',
        'SK00440811': 'PYT3T_07369',
        'SK00104967': 'PYT3T_07371',
        'SK00440767': 'PYT3T_07386',
        'SK00440759': 'PYT3T_07388',
        'SK00440775': 'PYT3T_07435',
        'SK00440812': 'PYT3T_07437',
        'SK00440804': 'PYT3T_07452',
        'SK00440814': 'PYT3T_07454',
        'SK90902716': 'DEMO_000163',
        'SE8V05024304': 'PYT3T_09056',
        'SK90904840': 'PYT3T_07139',
        'SK90904843': 'PYT3T_07171',
        'SK90904811': 'PYT3T_07182',
        'SK90904886': 'PYT3T_07189',
        'SK00103585': 'PYT3T_07216',
        'SK00104957': 'PYT3T_07218',
        'SK00103997': 'PYT3T_07241',
        'SK00104018': 'PYT3T_07243',
        'SK00104005': 'PYT3T_07248',
        'SK00103996': 'PYT3T_07250',
        'SK00104938': 'PYT3T_07252',
        'SK00104917': 'PYT3T_07275',
        'SK00103979': 'PYT3T_07277',
        'SK00104913': 'PYT3T_07282',
        'SK00104943': 'PYT3T_07284',
        'SK00103946': 'PYT3T_07307',
        'SK00103936': 'PYT3T_07309',
        'SK00103592': 'PYT3T_07314',
        'SK00103957': 'PYT3T_07316',
        'SK00103952': 'PYT3T_07339',
        'SK00103947': 'PYT3T_07341',
        'SK00103599': 'PYT3T_07348',
        'SK00103948': 'PYT3T_07350',
        'SK00104979': 'PYT3T_07373',
        'SK00440719': 'PYT3T_07375',
        'SK00104978': 'PYT3T_07382',
        'SK00440723': 'PYT3T_07384',
        'SK00440755': 'PYT3T_07422',
        'SK00440744': 'PYT3T_07424',
        'SK00440792': 'PYT3T_07431',
        'SK00440772': 'PYT3T_07433',
        'SK00440783': 'PYT3T_07456',
        'SK00440785': 'PYT3T_07458',
        'SK10112946': 'DEMO_000073',
        'SK10112927': 'DEMO_000074',
        'SK10112935': 'DEMO_000077',
        'SK10306879': 'DEMO_000127',
        'SK00440793': 'DEMO_000159',
        'SK90902734': 'DEMO_000161',
        'SK01003220': 'DEMO_000192',
        'SK01003162': 'DEMO_000194',
        'SK10113092': 'DEMO_000294',
        'SK01003259': 'DEMO_000296',
        'SK30125755': 'DEMO_000515',
        'SK30125801': 'DEMO_000516',
        'SK90904893': 'PYT3T_07128',
        'SK90904813': 'PYT3T_07150',
        'SK90904849': 'PYT3T_07151',
        'SK90904845': 'PYT3T_07186',
        'SK90904821': 'PYT3T_07187',
        'SK90904838': 'PYT3T_07199',
        'SK00103935': 'PYT3T_07211',
        'SK00103963': 'PYT3T_07212',
        'SK00103926': 'PYT3T_07229',
        'SK00104002': 'PYT3T_07230',
        'SK00103999': 'PYT3T_07244',
        'SK00104939': 'PYT3T_07247',
        'SK00104014': 'PYT3T_07261',
        'SK00104912': 'PYT3T_07262',
        'SK00104015': 'PYT3T_07279',
        'SK00104930': 'PYT3T_07280',
        'SK00103594': 'PYT3T_07294',
        'SK00104940': 'PYT3T_07297',
        'SK00103961': 'PYT3T_07298',
        'SK00103616': 'PYT3T_07311',
        'SK00103923': 'PYT3T_07312',
        'SK00103612': 'PYT3T_07329',
        'SK00103608': 'PYT3T_07330',
        'SK00103602': 'PYT3T_07343',
        'SK00103938': 'PYT3T_07344',
        'SK00103582': 'PYT3T_07347',
        'SK00440763': 'PYT3T_07361',
        'SK00105106': 'PYT3T_07362',
        'SK00440745': 'PYT3T_07379',
        'SK00104977': 'PYT3T_07380',
        'SK00440726': 'PYT3T_07394',
        'SK00440752': 'PYT3T_07397',
        'SK00104972': 'PYT3T_07428',
        'SK00440758': 'PYT3T_07429',
        'SK00440803': 'PYT3T_07443',
        'SK00440810': 'PYT3T_07446',
        'SK10112945': 'DEMO_000072',
        'SK10112851': 'DEMO_000082',
        'SK10112925': 'DEMO_000075',
        'SK10112879': 'DEMO_000079',
        'SE8V06025309': 'PYT3T_09054',
        'SK30125753': 'DEMO_000512',
        'SK30125848': 'DEMO_000519',
        'SK00103600': 'PYT3T_07131',
        'SK90904809': 'PYT3T_07138',
        'SK00103937': 'PYT3T_07147',
        'SK90904862': 'PYT3T_07172',
        'SK90904822': 'PYT3T_07183',
        'SK90904868': 'PYT3T_07190',
        'SK00103626': 'PYT3T_07192',
        'SK00103595': 'PYT3T_07215',
        'SK00103977': 'PYT3T_07226',
        'SK00103973': 'PYT3T_07233',
        'SK00104000': 'PYT3T_07240',
        'SK00104942': 'PYT3T_07251',
        'SK00104004': 'PYT3T_07258',
        'SK00104932': 'PYT3T_07265',
        'SK00104955': 'PYT3T_07276',
        'SK00103991': 'PYT3T_07283',
        'SK00103614': 'PYT3T_07290',
        'SK00103617': 'PYT3T_07301',
        'SK00103943': 'PYT3T_07308',
        'SK00103588': 'PYT3T_07315',
        'SK00103620': 'PYT3T_07323',
        'SK00103954': 'PYT3T_07321',
        'SK00103622': 'PYT3T_07333',
        'SK00103964': 'PYT3T_07340',
        'SK00103960': 'PYT3T_07351',
        'SK00103597': 'PYT3T_07358',
        'SK00104962': 'PYT3T_07365',
        'SK00105003': 'PYT3T_07376',
        'SK00440773': 'PYT3T_07383',
        'SK00440738': 'PYT3T_07390',
        'SK00440753': 'PYT3T_07425',
        'SK00440722': 'PYT3T_07432',
        'SK00104991': 'PYT3T_07439',
        'SK00440795': 'PYT3T_07450',
        'SK00105070': 'PYT3T_07457',
        'SK10112989': 'DEMO_000083',
        'SK10113080': 'DEMO_000128',
        'SK90902721': 'DEMO_000160',
        'SK01003255': 'DEMO_000193',
        'SK01003140': 'DEMO_000295',
    }
    dir_path = ''
    if getattr(sys, 'frozen', False):
        dir_path = os.path.dirname(sys.executable)
    else:
        dir_path = os.path.dirname(os.path.realpath(__file__))
    path = os.path.join(dir_path, 'REPORTS')
    dir_list = os.listdir(path)
    name_arr = []
    with Progress() as progress:
        task = progress.add_task(
            "[cyan]เปลี่ยนชื่อไฟล์[/cyan]", total=len(dir_list))
        for file_name in dir_list:
            source = os.path.join(path, file_name)
            print(file_name)
            # remove extension
            file_name = file_name.split('.')[0]
            if file_name in sn_list:
                pm_name = sn_list[file_name] + '_pm.pdf'
                cal_name = sn_list[file_name] + '_cal.pdf'
                os.rename(source, os.path.join(path, pm_name))
                # copy file to cal
                shutil.copyfile(os.path.join(path, pm_name),
                                os.path.join(path, cal_name))
            
                print('[grey42]{}[/grey42] [yellow]>>>>[/yellow] [green]{}[/green]'.format(
                    file_name, pm_name))
                progress.update(task, advance=1)
            else:
                print('[red]ไม่พบ SN ในรายการ[/red]')
                progress.update(task, advance=1)
            # # if file_name.find('_') == -1:
            # file = fitz.open(source)
            # page = file[0]
            # # find text with regex /ID CODE.*\n.*$/gm
            # page = page.get_text()
            # text = re.findall(r'ID CODE.*\n.*$', page, re.MULTILINE)
            # if len(text) == 0:
            #     print(
            #         '[red]ไม่พบข้อมูลรหัสเครื่องมือใน PDF[/red] : [yellow]{}[/yellow]'.format(file_name))
            #     progress.update(task, advance=1)
            #     continue
            # code = text[0].split('\n')[1].replace(':', '').strip()
            # name_arr.append(code)
            # cal = re.findall(r'Certificate', page, re.MULTILINE)
            # if len(cal) > 0:
            #     name = code + '_cal.pdf'
            # else:
            #     name = code + '_pm.pdf'
            # # file.save(os.path.join(path, name))
            # file.close()
            # os.rename(source, os.path.join(path, name))


            # print('[grey42]{}[/grey42] [yellow]>>>>[/yellow] [green]{}[/green]'.format(
            #     file_name, name))
            # progress.update(task, advance=1)
            # else:
            #     filename = file_name.split('_')
            #     if len(filename) > 1 and len(filename[1]) > 10:
            #         filename = "_".join(filename[1:])
            #         filename = re.sub(r'\s\(\d{1,}\)', '', filename)
            #         name = filename.split('(')[0]
            #         if (filename.split('(')[-1] != '1).pdf' and filename.split('(')[-1] != '2).pdf'):
            #             name_arr.append(name)
            #             if filename.split('(')[1].find('PM') > -1:
            #                 name = name + '_pm.pdf'
            #             else:
            #                 name = name + '_cal.pdf'
            #             print('เปลี่ยนชื่อไฟล์ [yellow]{}[/yellow] เป็น [yellow]{}[/yellow]'.format(
            #                 file_name, name))
            #             dest = os.path.join(path, name)
            #             os.rename(source, dest)

            # append name_arr to clipboard

        # unique_arr = []
        # for name in name_arr:
        #     if name not in unique_arr:
        #         unique_arr.append(name)

        # pyperclip.copy('\n'.join(unique_arr))
    print('\n[green]เปลี่ยนชื่อไฟล์เสร็จสิ้น[/green]')
    print('\n[purple]กดปุ่มใดก็ได้เพื่อกลับสู่เมนูหลัก : [/purple]', end='')
    input()
    # clear console
    os.system('cls' if os.name == 'nt' else 'clear')
    print(init_text)
    showmenu()


